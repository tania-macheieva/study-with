const express = require('express');
const router = express.Router();
const pool = require('./db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const storage = require('./course-creation/storage-config');

const upload = multer({ storage }).fields([
    { name: 'course_thumbnail', maxCount: 1 },
    { name: 'lecture_files'},
]);

router.post(
    '/create',
    upload,
    async (req, res) => {
        const {
            course_title,
            course_description,
            course_price,
            course_category,
            education_level,
            author_id,
            modules,
        } = req.body;

        console.log('Files:', req.files);
        console.log('Body:', req.body);

        const courseThumbnail = req.files['course_thumbnail']
            ? req.files['course_thumbnail'][0].filename
            : null;

        if (!course_title || !course_description || !course_price || !course_category || !education_level || !author_id) {
            return res.status(400).json({ success: false, message: 'Please fill all required fields!' });
        }

        try {
            // Check category
            const categoryCheckQuery = `SELECT id FROM categories WHERE id = $1 LIMIT 1`;
            const categoryResult = await pool.query(categoryCheckQuery, [course_category]);

            if (categoryResult.rows.length === 0) {
                return res.status(400).json({ success: false, message: 'Category does not exist!' });
            }

            // Check education level
            const educationLevelCheckQuery = `SELECT id FROM education_levels WHERE id = $1 LIMIT 1`;
            const educationLevelResult = await pool.query(educationLevelCheckQuery, [education_level]);

            if (educationLevelResult.rows.length === 0) {
                return res.status(400).json({ success: false, message: 'Education level does not exist!' });
            }

            const query = `
                INSERT INTO all_courses (name, description, price, category_id, image_url, author_id, education_level_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id;
            `;

            const result = await pool.query(query, [
                course_title,
                course_description,
                course_price,
                categoryResult.rows[0].id,
                courseThumbnail,
                author_id,
                educationLevelResult.rows[0].id,
            ]);

            const courseId = result.rows[0].id;

            // Handle modules
            if (modules && modules !== 'undefined' && modules !== null) {
                let modulesArray = [];
                try {
                    modulesArray = JSON.parse(modules);
                } catch (err) {
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
                            const lecturePromises = moduleLectures.map(async (lecture, index) => {
                                const { title, description } = lecture;

                                if (!title) {
                                    throw new Error('Lecture must have a title.');
                                }

                                const lectureResult = await pool.query(
                                    `INSERT INTO lectures (module_id, title, description, order_num) VALUES ($1, $2, $3, $4) RETURNING id`,
                                    [moduleId, title, description, index + 1]
                                );

                                if (req.files['lecture_files']) {
                                    const lectureFiles = req.files['lecture_files'];

                                    const lectureFilePromises = lectureFiles.map((file) => {
                                        return pool.query(
                                            `INSERT INTO lecture_files (lecture_id, file_name, file_url, file_type)
                                            VALUES ($1, $2, $3, $4)`,
                                            [
                                                lectureResult.rows[0].id,
                                                file.originalname,
                                                file.path,
                                                file.mimetype,
                                            ]
                                        );
                                    });

                                    await Promise.all(lectureFilePromises);
                                }
                            });

                            await Promise.all(lecturePromises);
                        }
                    });
                });

                await Promise.all(modulePromises);
            }

            return res.json({ success: true, message: 'Course created successfully!', courseId });
        } catch (err) {
            console.error('Error creating course:', err);
            return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
        }
    }
);


module.exports = router;
