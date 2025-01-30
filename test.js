const express = require('express');
const router = express.Router();
const { pool } = require('./db');



// API для збереження тесту
/*router.post('/save-test', async (req, res) => {
    const { title, questions } = req.body;
    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Title and questions are required' });
    }
  
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const existingTest = await client.query(
        'SELECT id FROM tests WHERE title = $1',
        [title]
      );
      if (existingTest.rows.length > 0) {
        return res.status(400).json({ message: 'A test with this title already exists' });
      }
  
      const testResult = await client.query(
        'INSERT INTO tests (title) VALUES ($1) RETURNING id',
        [title]
      );
      const testId = testResult.rows[0].id;
  
      const questionsValues = questions.map(
        (q) => `(${testId}, '${q.type}', '${q.questionText.replace(/'/g, "''")}')`
      ).join(',');
  
      const questionResults = await client.query(
        `INSERT INTO questions (test_id, type, question_text) VALUES ${questionsValues} RETURNING id`
      );
  
      const answersValues = [];
      questionResults.rows.forEach((question, index) => {
        const questionId = question.id;
        questions[index].answers.forEach(answer => {
          answersValues.push(`(${questionId}, '${answer.answerText.replace(/'/g, "''")}', ${answer.isCorrect})`);
        });
      });
  
      if (answersValues.length > 0) {
        await client.query(
          `INSERT INTO answers (question_id, answer_text, is_correct) VALUES ${answersValues.join(',')}`
        );
      }
  
      await client.query('COMMIT');
      res.status(200).json({ message: 'Test saved successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ message: 'Error saving test', error: error.message });
    } finally {
      client.release();
    }
  });
  


// API для отримання тесту
router.get('/get-test/:id', async (req, res) => {
    const testId = req.params.id;
  
    try {
      const testResult = await pool.query('SELECT * FROM tests WHERE id = $1', [testId]);
      if (testResult.rows.length === 0) {
        return res.status(404).json({ message: 'Test not found' });
      }
      const test = testResult.rows[0];
  
      const questionsResult = await pool.query('SELECT * FROM questions WHERE test_id = $1', [testId]);
      const questions = questionsResult.rows;
  
      const answersResult = await pool.query(
        'SELECT * FROM answers WHERE question_id = ANY($1::int[])',
        [questions.map(q => q.id)]
      );
  
      const answersMap = answersResult.rows.reduce((map, answer) => {
        if (!map[answer.question_id]) map[answer.question_id] = [];
        map[answer.question_id].push(answer);
        return map;
      }, {});
  
      questions.forEach(question => {
        question.answers = answersMap[question.id] || [];
      });
  
      res.status(200).json({ test, questions });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching test', error: error.message });
    }
  });*/

  // Маршрут для збереження тесту
router.post('/save-test', async (req, res) => {
  console.log('Request body:', req.body); 
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
  // Маршрут для отримання тесту за ID
/*router.get('/get-test/:testId', async (req, res) => {
  const { testId } = req.params;

  // Перевірка валідності ID
  if (isNaN(testId)) {
    return res.status(400).json({ error: 'Invalid test ID' });
  }

  try {
    // Отримання тесту за ID
    const testResult = await pool.query('SELECT * FROM tests WHERE id = $1', [testId]);

    if (testResult.rows.length === 0) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const test = testResult.rows[0];

    // Отримання питань тесту
    const questionsResult = await pool.query(
      'SELECT * FROM questions WHERE test_id = $1',
      [testId]
    );

    // Формуємо питання та їхні відповіді
    const questions = await Promise.all(
      questionsResult.rows.map(async (question) => {
        if (question.type === 'Matching') {
          // Отримання підпитань для "Matching"
          const subquestionsResult = await pool.query(
            'SELECT * FROM subquestions WHERE question_id = $1',
            [question.id]
          );

          // Обробка кожного підпитання
          const subquestions = await Promise.all(
            subquestionsResult.rows.map(async (subquestion) => {
              const answersResult = await pool.query(
                'SELECT * FROM answers WHERE subquestion_id = $1',
                [subquestion.id]
              );

              return {
                id: subquestion.id,
                subquestionText: subquestion.subquestion_text,
                answers: answersResult.rows.map((answer) => ({
                  id: answer.id,
                  answerText: answer.answer_text,
                })),
              };
            })
          );

          return {
            id: question.id,
            type: question.type,
            questionText: question.question_text,
            subquestions,
          };
        } else {
          // Отримання відповідей для інших типів питань
          const answersResult = await pool.query(
            'SELECT * FROM answers WHERE question_id = $1 AND subquestion_id IS NULL',
            [question.id]
          );

          return {
            id: question.id,
            type: question.type,
            questionText: question.question_text,
            answers: answersResult.rows.map((answer) => ({
              id: answer.id,
              answerText: answer.answer_text,
            })),
          };
        }
      })
    );

    // Формування остаточного результату
    res.status(200).json({
      id: test.id,
      title: test.title,
      createdAt: test.created_at,
      questions,
    });
  } catch (error) {
    console.error('Error fetching test:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});*/
// Маршрут для отримання даних тесту
router.get('/get-test/:testId', async (req, res) => {
  console.log('Request body:', req.params); 
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
      console.log('Request body:', row); 
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

// Отримання посилання на тест за ID
/*router.get('/share-link/:testId', async (req, res) => {
  const { testId } = req.params;

  try {
    // Перевірка, чи існує тест
    const test = await TestModel.findById(testId); // Передбачається, що є модель TestModel
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Генеруємо посилання для тесту
    const testLink = `${req.protocol}://${req.get('host')}/tests/pass/${testId}`;

    return res.json({ link: testLink });
  } catch (error) {
    console.error('Error fetching test link:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});
router.post('/tests/submit', async (req, res) => {
  const { testId, answers, teacherEmail } = req.body;

  // Перевірка наявності всіх обов'язкових полів
  if (!testId || !answers || !teacherEmail) {
    return res.status(400).json({ error: 'Test ID, answers, and teacher email are required.' });
  }

  try {
    // Знайти тест у базі даних
    const test = await TestModel.findById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found.' });
    }

    // Генерація тексту листа
    const emailContent = `
      Виконаний тест: ${test.title || 'Без назви'}\n
      ID тесту: ${testId}\n
      Відповіді учня:\n
      ${Object.entries(answers)
        .map(([question, answer]) => `- ${question}: ${answer}`)
        .join('\n')}
    `;

    // Налаштування Nodemailer
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Використовуйте App Password
      },
    });

    // Відправити лист вчителю та платформі
    const mailOptions = {
      from: process.env.EMAIL_USER || 'studywith.connect@gmail.com',
      to: [teacherEmail, 'studywith.connect@gmail.com'], // Надсилається вчителю і на платформу
      subject: `Виконаний тест: ${test.title || 'Без назви'}`,
      text: emailContent,
    };

    await transporter.sendMail(mailOptions);

    // Успішна відповідь
    return res.json({ message: 'Test submitted successfully!' });
  } catch (error) {
    console.error('Error submitting test:', error);
    return res.status(500).json({ error: 'Failed to submit the test.' });
  }
});*/

module.exports = router;