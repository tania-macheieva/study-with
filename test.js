const express = require('express');
const path = require('path');
const router = express.Router();
const { pool } = require('./db');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');



  // Маршрут для збереження тесту
router.post('/save-test', async (req, res) => {
  //console.log('Request body:', req.body); 
    const { title, questions } = req.body;
  
    // Перевірка валідності вхідних даних
    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    let client; // Оголосіть змінну client на рівні маршруту
  try {
    client = await pool.connect(); // Створення клієнта з пулу
    await client.query('BEGIN'); // Початок транзакції
      // Додавання тесту
    const testResult = await client.query(
      'INSERT INTO tests (title) VALUES ($1) RETURNING id',
      [title]
    );
    const testId = testResult.rows[0].id;
  
     // Додавання питань та відповідей
    for (const question of questions) {
      console.log('Processing question:', question); 
      // Перевірка валідності кожного питання
      if (!question.type || !question.questionText || !Array.isArray(question.answers)) {
        throw new Error('Invalid question format');
      }
      const questionResult = await client.query(
        'INSERT INTO questions (test_id, type, question_text) VALUES ($1, $2, $3) RETURNING id',
        [testId, question.type, question.questionText]
      );
      const questionId = questionResult.rows[0].id;

      if (question.type === 'Matching') {
        for (const answer of question.answers) {
          console.log('Processing Matching answer:', answer); 
          if (!answer.questionText || !answer.answerText) {
            throw new Error('Invalid Matching answer format');
          }

          const subquestionResult = await client.query(
            'INSERT INTO subquestions (question_id, subquestion_text) VALUES ($1, $2) RETURNING id',
            [questionId, answer.questionText]
          );
          const subquestionId = subquestionResult.rows[0].id;

          await client.query(
            'INSERT INTO answers (question_id, subquestion_id, answer_text) VALUES ($1, $2, $3)',
            [questionId, subquestionId, answer.answerText]
          );
        }
      }else if (question.type === 'Open-ended') {
        for (const answer of question.answers) {
          console.log('Processing Open-ended answer:', answer); // Дебаг Open-ended відповіді
          if (typeof answer.answerText !== 'string' || answer.answerText.trim() === '') {
            throw new Error('Open-ended answer cannot be empty');
          }
          await client.query(
            'INSERT INTO answers (question_id, answer_text) VALUES ($1, $2)',
            [questionId, answer.answerText]
          );
        }
      } else {
        for (const answer of question.answers) {
          console.log('Processing answer:', answer);
          if (!answer.answerText) {
            throw new Error('Invalid answer format');
          }

          await client.query(
            'INSERT INTO answers (question_id, answer_text, is_correct) VALUES ($1, $2, $3)',
            [questionId, answer.answerText, answer.isCorrect || false]
          );
        }
      }
    }
  
  // Завершення транзакції
  await client.query('COMMIT');
  res.status(200).json({ message: 'Test saved successfully', testId });
} catch (error) {
  if (client) {
    await client.query('ROLLBACK'); // Відкат транзакції, якщо client створений
  }
  console.error('Error saving test:', error);
  res.status(500).json({ error: 'Internal server error' });
} finally {
  if (client) {
    client.release(); // Звільнення клієнта після використання
  }
}
});

// Маршрут для отримання даних тесту
router.get('/get-test/:testId', async (req, res) => {
  //console.log('Request body:', req.params); 
  const { testId } = req.params;
  if (!testId) {
    return res.status(400).json({ error: 'Test ID is required' });
  }
  try {
    // Отримуємо інформацію про тест
    const testQuery = `
      SELECT id, title, created_at 
      FROM tests 
      WHERE id = $1;
    `;
    const testResult = await pool.query(testQuery, [testId]);

    if (testResult.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const test = testResult.rows[0];

    // Отримуємо всі питання, підпитання та відповіді, пов’язані з тестом
    const query = `
      SELECT 
  q.id AS question_id,
  q.type AS question_type,
  q.question_text,
  q.created_at AS question_created_at,
  sq.id AS subquestion_id,
  sq.subquestion_text,
  a.id AS answer_id,
  a.answer_text,
  a.is_correct,
  a.created_at AS answer_created_at
FROM questions q
LEFT JOIN subquestions sq ON q.id = sq.question_id
LEFT JOIN answers a ON q.id = a.question_id AND (sq.id = a.subquestion_id OR a.subquestion_id IS NULL)
WHERE q.test_id = $1
ORDER BY q.id, sq.id, a.id;

    `;

    const result = await pool.query(query, [testId]);
  
    // Створюємо структуру для питань
    const questions = [];
    const questionMap = {};
    const createAnswer = (id, text, isCorrect) => ({
      id,
      answerText: text,
      isCorrect,
    });

    result.rows.forEach((row) => {
      const {
        question_id,
        question_type,
        question_text,
        subquestion_id,
        subquestion_text,
        answer_id,
        answer_text,
        is_correct,
      } = row;
      //console.log('Request body:', row); 
       // Додаємо питання, якщо воно ще не оброблено
       if (!questionMap[question_id]) {
        questionMap[question_id] = {
          id: question_id,
          type: question_type,
          questionText: question_text,
          subquestions: [],
          answers: [],
        };
        questions.push(questionMap[question_id]);
      }

      const question = questionMap[question_id];

      if (subquestion_id) {
        let subquestion = question.subquestions.find((sq) => sq.id === subquestion_id);
        if (!subquestion) {
          subquestion = {
            id: subquestion_id,
            subquestionText: subquestion_text,
            answers: [],
          };
          question.subquestions.push(subquestion);
        }
        if (answer_id) {
          subquestion.answers.push(createAnswer(answer_id, answer_text, is_correct));
        }
      } else if (answer_id) {
        question.answers.push(createAnswer(answer_id, answer_text, is_correct));
      }
    });

    test.questions = questions;

    res.json(test);
  } catch (error) {
    console.error('Error fetching test data:', error);
    if (error.code === '22P02') {
      return res.status(400).json({ error: 'Invalid Test ID format' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Налаштування Nodemailer для Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,         // ваша електронна пошта
    pass: process.env.EMAIL_PASSWORD,// Використовуйте пароль додатку (App Password)
  },
});


// Маршрут для отримання пар відповідей
/*router.post('/api/matching-pairs', async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const { questionId } = req.body;

    if (!questionId) {
      return res.status(400).json({ error: 'Missing questionId' });
    }
    const query = `
      SELECT 
        sq.id AS subquestion_id, 
        sq.subquestion_text, 
        a.id AS answer_id, 
        a.answer_text
      FROM subquestions sq
      JOIN answers a ON sq.id = a.subquestion_id
      WHERE sq.question_id =  $1;
    `;

    const { rows } = await pool.query(query, [questionId]);
    console.log('Received request body:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
 
});*/
// Маршрут для надсилання результатів тесту
router.post('/send-test-results', async (req, res) => {
  try {
    console.log('Received request:', req.body);

    // Отримуємо токен з заголовків
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Authorization header:', req.headers.authorization);

    if (!token) {
      return res.status(401).json({ error: 'Authorization token is missing.' });
    }

    // Перевіряємо токен та отримуємо email користувача
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('JWT verification failed:', err);
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    const email = decoded.email;
    console.log('Authorized email:', email);

    if (!email) {
      return res.status(401).json({ error: 'Failed to extract email from token.' });
    }

    // Отримуємо дані тесту
    const { testId, teacherEmail, results } = req.body;

    if (!testId || !teacherEmail || !results) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    console.log('Test ID:', testId);
    console.log('Teacher Email:', teacherEmail);
    console.log('Results:', results);

    // Формуємо вміст листа
    const mailOptions = {
      from: email,
      to: [teacherEmail, 'studywith.connect@gmail.com'], // Надсилаємо вчителю та платформі
      subject: `Test Results for Test ID: ${testId}`,
      text: `Hello,\n\nHere are the test results for Test ID: ${testId}.\n\n${results}\n\nBest regards,\nStudyWith`
    };

    console.log('Sending email with options:', mailOptions);

    // Відправляємо лист
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ error: 'Failed to send test results.', details: err.message });
      }
      console.log('Email sent successfully:', info.response);
      return res.status(200).json({ message: 'Test results sent successfully.' });
    });

  } catch (error) {
    console.error('Unexpected server error:', error);
    res.status(500).json({ error: 'Server error occurred while sending test results.' });
  }
});


module.exports = router;