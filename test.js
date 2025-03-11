const express = require('express');
const path = require('path');
const router = express.Router();
const { pool } = require('./db');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
require('dotenv').config();
const secretKey = process.env.ENCRYPT_SECRET;

function encryptTestInfo(testInfo) {
  try {
    const testInfoStr = JSON.stringify(testInfo);
    return CryptoJS.AES.encrypt(testInfoStr, secretKey).toString();
  } catch (error) {
    console.error('Error encrypting test info:', error);
    return null;
  }
}

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
      } else if (question.type === 'Open-ended') {
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
    //  Шифруємо testId перед відправкою клієнту
    const encryptedTestId = CryptoJS.AES.encrypt(testId.toString(), secretKey).toString();
    res.status(200).json({ message: 'Test saved successfully', testId: encryptedTestId });
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
router.get('/get-test/:encryptedTestId', async (req, res) => {
  const { encryptedTestId } = req.params;
  const { moduleId, courseId, testType } = req.query; // Додані параметри запиту
  
  if (!encryptedTestId) {
    return res.status(400).json({ error: 'Test ID is required' });
  }
  
  try {
    // Розшифровуємо testId
    let testId;
    let testInfo = null;
    
    try {
      const bytes = CryptoJS.AES.decrypt(decodeURIComponent(encryptedTestId), secretKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      // Спробуємо розпарсити як JSON (для нового формату)
      try {
        testInfo = JSON.parse(decrypted);
        testId = testInfo.testId || testInfo.id || decrypted;
      } catch (e) {
        // Якщо не JSON, використовуємо як простий ID (для старого формату)
        testId = decrypted;
      }
    } catch (error) {
      console.error('Error decrypting test ID:', error);
      return res.status(400).json({ error: 'Invalid test ID' });
    }
    
    if (!testId) {
      return res.status(400).json({ error: 'Invalid test ID' });
    }

    const testResult = await pool.query('SELECT * FROM tests WHERE id = $1', [testId]);

    // Перевірка, чи знайдено тест
    if (testResult.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const test = testResult.rows[0];

    // Отримуємо всі питання, підпитання та відповіді, пов'язані з тестом
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
      ORDER BY q.id, sq.id, a.id
    `;

    // Виконуємо запит і зберігаємо результати
    const questionsResult = await pool.query(query, [testId]);
    console.log('Questions query result length:', questionsResult.rows.length);

    // Обробляємо результати запиту та формуємо масив питань
    test.questions = [];
    const questionsMap = new Map();

    for (const row of questionsResult.rows) {
      if (!questionsMap.has(row.question_id)) {
        // Створюємо новий об'єкт питання
        questionsMap.set(row.question_id, {
          id: row.question_id,
          type: row.question_type,
          questionText: row.question_text,
          answers: [],
          subquestions: []
        });
        
        // Додаємо питання до масиву
        test.questions.push(questionsMap.get(row.question_id));
      }
      
      // Обробляємо відповіді в залежності від типу питання
      if (row.answer_id) {
        const question = questionsMap.get(row.question_id);
        
        if (row.question_type === 'Matching' && row.subquestion_id) {
          // Для питань типу Matching зберігаємо підпитання та відповіді окремо
          let subquestion = question.subquestions.find(sq => sq.id === row.subquestion_id);
          
          if (!subquestion) {
            subquestion = {
              id: row.subquestion_id,
              subquestionText: row.subquestion_text,
              answers: []
            };
            question.subquestions.push(subquestion);
          }
          
          subquestion.answers.push({
            id: row.answer_id,
            answerText: row.answer_text,
            isCorrect: row.is_correct
          });
        } else {
          // Для інших типів питань додаємо відповіді напряму
          question.answers.push({
            id: row.answer_id,
            answerText: row.answer_text,
            isCorrect: row.is_correct
          });
        }
      }
    }

    console.log('Final test questions count:', test.questions.length);

    // Додаємо інформацію про тест
    if (!testInfo) {
      testInfo = { 
        testId: testId
      };
      
      // Додаємо інформацію з параметрів запиту, якщо вона є
      if (moduleId) testInfo.moduleId = moduleId;
      if (courseId) testInfo.courseId = courseId;
      if (testType) testInfo.type = testType;
    }

    // Додаємо цю інформацію до відповіді
    test._testInfo = testInfo;
    
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
    pass: process.env.EMAIL_PASSWORD,     // Використовуйте пароль додатку (App Password)
  },
});

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