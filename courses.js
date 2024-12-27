const express = require('express');
const router = express.Router();
const pool = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
// Налаштування multer для завантаження файлів 
router.post('/create', upload.single('course_thumbnail'), async (req, res) => {
  const { course_title, course_description, course_price, course_category, education_level, author_id } = req.body;
  const courseThumbnail = req.file ? req.file.filename : null; // Якщо файл є, то беремо його ім'я

  // Перевірка на обов'язкові поля
  if (!course_title || !course_description || !course_price || !course_category || !education_level || !author_id) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields!' });
  }

  // Додавання курсу до бази даних
  try {
      const query = `
          INSERT INTO all_courses (name, description, price, category_id, image_url, author_id)
          VALUES ($1, $2, $3, (SELECT id FROM categories WHERE name = $4 LIMIT 1), $5, $6)
          RETURNING id;
      `;
      const result = await pool.query(query, [course_title, course_description, course_price, course_category, courseThumbnail, author_id]);
      res.json({ success: true, message: 'Course created successfully!', courseId: result.rows[0].id });
  } catch (err) {
      console.error('Error creating course:', err);
      res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
});


module.exports = router;