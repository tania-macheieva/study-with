const express = require('express');
const router = express.Router();
const pool = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
// Налаштування multer для завантаження файлів 
    router.post('/create', upload.single('course_thumbnail'), async (req, res) => {
        const { course_title, course_description, course_price, course_category, education_level, author_id, modules, lectures } = req.body;
        const courseThumbnail = req.file ? req.file.filename : null;

        if (!course_title || !course_description || !course_price || !course_category || !education_level || !author_id) {
            return res.status(400).json({ success: false, message: 'Please fill all required fields!' });
        }

        try {
            // Перевірка категорії
            const categoryCheckQuery = `SELECT id FROM categories WHERE id = $1 LIMIT 1`;
            const categoryResult = await pool.query(categoryCheckQuery, [course_category]);

            if (categoryResult.rows.length === 0) {
                if (!res.headersSent) {
                    return res.status(400).json({ success: false, message: 'Category does not exist!' });
                }
            }
            const categoryId = categoryResult.rows[0].id;

            // Перевірка рівня освіти
            const educationLevelCheckQuery = `SELECT id FROM education_levels WHERE id = $1 LIMIT 1`;
            const educationLevelResult = await pool.query(educationLevelCheckQuery, [education_level]);

            if (educationLevelResult.rows.length === 0) {
                if (!res.headersSent) {
                    return res.status(400).json({ success: false, message: 'Education level does not exist!' });
                }
            }
            const educationLevelId = educationLevelResult.rows[0].id;

            // Вставка нового курсу
            const query = `
                INSERT INTO all_courses (name, description, price, category_id, image_url, author_id, education_level_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id;
            `;
            const result = await pool.query(query, [course_title, course_description, course_price, categoryId, courseThumbnail, author_id, educationLevelId]);
            const courseId = result.rows[0].id;

            // Перевірка і обробка модулів
            if (modules && modules !== "undefined" && modules !== null) {
                let modulesArray = [];
                try {
                    modulesArray = JSON.parse(modules);  
                } catch (err) {
                    console.error('Invalid modules JSON:', err);  
                    return res.status(400).json({ success: false, message: 'Invalid modules data!' });
                }
            
                const modulePromises = modulesArray.map((module) => {
                    const { title, order_num, lectures: moduleLectures } = module;
                
                    if (!title || !order_num) {
                        throw new Error('Module must have a title and order_num.');
                    }
                
                    return pool.query(
                        `INSERT INTO modules (course_id, title, order_num) VALUES ($1, $2, $3) RETURNING id`,
                        [courseId, title, order_num]
                    ).then(async (moduleResult) => {
                        const moduleId = moduleResult.rows[0].id;
                
                        if (moduleLectures && Array.isArray(moduleLectures)) {
                            // Збереження лекцій для модуля
                            const lecturePromises = moduleLectures.map((lecture, index) => {
                                const { title, description } = lecture;
                
                                // Автоматичне призначення порядкового номеру на основі індексу
                                const lectureOrder = index + 1;
                
                                if (!title) {
                                    throw new Error('Lecture must have a title.');
                                }
                
                                return pool.query(
                                    `INSERT INTO lectures (module_id, title, description, order_num) VALUES ($1, $2, $3, $4)`,
                                    [moduleId, title, description, lectureOrder]
                                );
                            });
                
                            await Promise.all(lecturePromises);
                        }
                    });
                });
                
                await Promise.all(modulePromises);
            }        

        // Відправка відповіді після успішного створення курсу, модулів та лекцій
        if (!res.headersSent) {
            return res.json({ success: true, message: 'Course, modules, and lectures created successfully!', courseId });
        }

    } catch (err) {
        console.error('Error creating course:', err);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
        }
    }
});

module.exports = router;