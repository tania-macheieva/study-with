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
    const courseThumbnail = req.file ? req.file.filename : null;

    if (!course_title || !course_description || !course_price || !course_category || !education_level || !author_id) {
        return res.status(400).json({ success: false, message: 'Please fill all required fields!' });
    }

    try {
        // Перевірка категорії за ID
        const categoryCheckQuery = `SELECT id FROM categories WHERE id = $1 LIMIT 1`;
        const categoryResult = await pool.query(categoryCheckQuery, [course_category]);

        if (categoryResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Category does not exist!' });
        }

        const categoryId = categoryResult.rows[0].id;

        // Перевірка рівня освіти за ID (можливо, рівні освіти зберігаються в окремій таблиці)
        const educationLevelCheckQuery = `SELECT id FROM education_levels WHERE id = $1 LIMIT 1`;
        const educationLevelResult = await pool.query(educationLevelCheckQuery, [education_level]);

        if (educationLevelResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Education level does not exist!' });
        }

        const educationLevelId = educationLevelResult.rows[0].id;

        // Вставка нового курсу в базу даних
        const query = `
            INSERT INTO all_courses (name, description, price, category_id, image_url, author_id, education_level_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id;
        `;
        const result = await pool.query(query, [course_title, course_description, course_price, categoryId, courseThumbnail, author_id, educationLevelId]);

        res.json({ success: true, message: 'Course created successfully!', courseId: result.rows[0].id });
    } catch (err) {
        console.error('Error creating course:', err);
        res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
});

module.exports = router;
