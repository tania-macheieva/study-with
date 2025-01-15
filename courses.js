const express = require('express');
const router = express.Router();
const pool = require('./db');
const multer = require('multer');
const storage = require('./course-creation/storage-config');
 
const upload = multer({ storage }).fields([
    { name: 'course_thumbnail', maxCount: 1 },
    { name: 'lecture_files' },
    { name: 'lecture_videos' },
]);
router.post('/save-draft', upload, async (req, res) => {
    const {
        course_title = '',
        course_description = '',
        course_price = '',
        course_category = null,
        education_level = null,
        author_id,
        modules,
        tags,
        course_id, // added course_id to identify course to update
    } = req.body;

    const parsedCoursePrice = course_price ? parseFloat(course_price) : 0;
    const parsedCourseCategory = course_category ? parseInt(course_category, 10) : null;
    const parsedEducationLevel = education_level ? parseInt(education_level, 10) : null;

    if (isNaN(parsedCoursePrice) || (course_category && isNaN(parsedCourseCategory)) || (education_level && isNaN(parsedEducationLevel))) {
        return res.status(400).json({ success: false, message: 'Invalid numeric fields!' });
    }

    const courseThumbnail = req.files['course_thumbnail'] ? req.files['course_thumbnail'][0].filename : null;

    if (!author_id) {
        return res.status(400).json({ success: false, message: 'Author ID is required!' });
    }

    let parsedTags = tags;
    if (tags && typeof tags === 'string') {
        parsedTags = [...new Set(tags.split(',').map(tag => tag.trim()))];
    }

    try {
        let courseId = course_id; // if provided, use course_id to find the existing course
        let courseToUpdate;

        if (courseId) {
            // Check if the course exists with the given course_id and author_id
            const courseQuery = `
                SELECT id, name, description, price, category_id, image_url, education_level_id, status 
                FROM all_courses 
                WHERE id = $1 AND author_id = $2 AND status != 'published'
            `;
            const courseResult = await pool.query(courseQuery, [courseId, author_id]);

            if (courseResult.rows.length > 0) {
                // If course exists, update it
                courseToUpdate = courseResult.rows[0];
                const updateQuery = `
                    UPDATE all_courses
                    SET
                        name = COALESCE($1, name),
                        description = COALESCE($2, description),
                        price = COALESCE($3, price),
                        category_id = COALESCE($4, category_id),
                        image_url = COALESCE($5, image_url),
                        education_level_id = COALESCE($6, education_level_id),
                        status = 'draft'  -- ensure it's saved as draft
                    WHERE id = $7;
                `;
                const updateValues = [
                    course_title || courseToUpdate.name,
                    course_description || courseToUpdate.description,
                    parsedCoursePrice || courseToUpdate.price,
                    parsedCourseCategory || courseToUpdate.category_id,
                    courseThumbnail || courseToUpdate.image_url,
                    parsedEducationLevel || courseToUpdate.education_level_id,
                    courseId,
                ];
                await pool.query(updateQuery, updateValues);
            } else {
                return res.status(404).json({ success: false, message: 'Course not found or not in draft status.' });
            }
        } else {
            // If no course_id provided, create a new course
            const query = `
                INSERT INTO all_courses (name, description, price, category_id, image_url, author_id, education_level_id, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
                RETURNING id;
            `;
            const result = await pool.query(query, [
                course_title,
                course_description,
                parsedCoursePrice,
                parsedCourseCategory,
                courseThumbnail,
                author_id,
                parsedEducationLevel,
            ]);
            courseId = result.rows[0].id;
        }

        // Process modules and lectures
        if (modules && modules !== 'undefined' && modules !== null) {
            let modulesArray = [];
            try {
                modulesArray = JSON.parse(modules);
            } catch (err) {
                return res.status(400).json({ success: false, message: 'Invalid modules data!' });
            }

            const modulePromises = modulesArray.map(async (module, index) => {
                const { title = '', order_num = index + 1, lectures: moduleLectures } = module;

                const moduleResult = await pool.query(
                    `INSERT INTO modules (course_id, title, order_num) VALUES ($1, $2, $3) RETURNING id`,
                    [courseId, title, order_num]
                );

                const moduleId = moduleResult.rows[0].id;

                if (moduleLectures && Array.isArray(moduleLectures)) {
                    const lecturePromises = moduleLectures.map(async (lecture, lectureIndex) => {
                        const { title = '', description = '' } = lecture;

                        await pool.query(
                            `INSERT INTO lectures (module_id, title, description, order_num) VALUES ($1, $2, $3, $4)`,
                            [moduleId, title, description, lectureIndex + 1]
                        );
                    });

                    await Promise.all(lecturePromises);
                }
            });

            await Promise.all(modulePromises);
        }

        // Insert tags into the tags table
        if (parsedTags && Array.isArray(parsedTags)) {
            const insertTagsQuery = `
                INSERT INTO tags (name) 
                SELECT * FROM (VALUES ${parsedTags.map((_, i) => `($${i + 1})`).join(', ')}) AS t(name)
                ON CONFLICT(name) DO NOTHING;
            `;
            await pool.query(insertTagsQuery, parsedTags);

            const selectTagIdsQuery = `
                SELECT id FROM tags WHERE name = ANY($1);
            `;
            const tagIdsResult = await pool.query(selectTagIdsQuery, [parsedTags]);

            const courseTagPromises = tagIdsResult.rows.map(tag => {
                return pool.query(`INSERT INTO course_tags (course_id, tag_id) VALUES ($1, $2)`, [courseId, tag.id]);
            });

            await Promise.all(courseTagPromises);
        }

        return res.json({
            success: true,
            message: 'Draft saved successfully!',
            courseId,
            tags: parsedTags,
        });
    } catch (err) {
        console.error('Error saving draft:', err);
        return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
});

router.post('/create', upload, async (req, res) => {
    const {
        course_title,
        course_description,
        course_price,
        course_category,
        education_level,
        author_id,
        modules, 
    } = req.body;

    const courseThumbnail = req.files['course_thumbnail']
        ? req.files['course_thumbnail'][0].filename
        : null;

    if (!course_title || !course_description || !course_price || !course_category || !education_level || !author_id) {
        return res.status(400).json({ success: false, message: 'Please fill all required fields!' });
    }

    let tags = req.body.tags;
    if (tags && typeof tags === 'string') {
        tags = tags.split(',').map(tag => tag.trim());
    }

    try {
        const categoryCheckQuery = 'SELECT id FROM categories WHERE id = $1 LIMIT 1';
        const categoryResult = await pool.query(categoryCheckQuery, [course_category]);

        if (categoryResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Category does not exist!' });
        }

        const educationLevelCheckQuery = 'SELECT id FROM education_levels WHERE id = $1 LIMIT 1';
        const educationLevelResult = await pool.query(educationLevelCheckQuery, [education_level]);

        if (educationLevelResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Education level does not exist!' });
        }

        // Перевірка чи курс вже існує з статусом "draft" для цього автора
        const existingCourseQuery = `
            SELECT id, status FROM all_courses WHERE author_id = $1 AND name = $2
        `;
        const existingCourseResult = await pool.query(existingCourseQuery, [author_id, course_title]);

        let courseId;

        if (existingCourseResult.rows.length > 0) {
            // Якщо курс існує в статусі "draft", просто оновлюємо його, змінюючи статус на "published"
            const existingCourse = existingCourseResult.rows[0];
            courseId = existingCourse.id;

            const updateQuery = `
                UPDATE all_courses
                SET 
                    name = COALESCE($1, name),
                    description = COALESCE($2, description),
                    price = COALESCE($3, price),
                    category_id = COALESCE($4, category_id),
                    image_url = COALESCE($5, image_url),
                    education_level_id = COALESCE($6, education_level_id),
                    status = 'published'
                WHERE id = $7
                RETURNING id;
            `;
            const updateValues = [
                course_title,
                course_description,
                course_price,
                categoryResult.rows[0].id,
                courseThumbnail,
                educationLevelResult.rows[0].id,
                courseId
            ];

            await pool.query(updateQuery, updateValues);
        } else {
            // Якщо курс не знайдений, створюємо новий курс зі статусом "published"
            const query = `
                INSERT INTO all_courses (name, description, price, category_id, image_url, author_id, education_level_id, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'published')
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

            courseId = result.rows[0].id;
        }


        // Handle modules and lectures
        if (modules && modules !== 'undefined' && modules !== null) {
            let modulesArray = [];
            try {
                modulesArray = JSON.parse(modules);
            } catch (err) {
                return res.status(400).json({ success: false, message: 'Invalid modules data!' });
            }

            const modulePromises = modulesArray.map(async (module) => {
                const { title, order_num, lectures: moduleLectures } = module;

                if (!title || !order_num) {
                    throw new Error('Module must have a title and order_num.');
                }

                const moduleResult = await pool.query(
                    `INSERT INTO modules (course_id, title, order_num) VALUES ($1, $2, $3) RETURNING id`,
                    [courseId, title, order_num]
                );

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

                        const lectureId = lectureResult.rows[0].id;


                        // Обробка файлів для лекції, обмежуємо до одного файлу на лекцію
                        const filesForThisLecture = req.files['lecture_files']?.slice(index, index + 1); // Вибираємо тільки один файл для кожної лекції

                        if (filesForThisLecture && filesForThisLecture.length > 0) {
                            // Очищаємо попередні файли для цієї лекції
                            await pool.query('DELETE FROM lecture_files WHERE lecture_id = $1', [lectureId]);

                            // Вставляємо новий файл для цієї лекції
                            const file = filesForThisLecture[0]; // Беремо перший файл
                            await pool.query(
                                `INSERT INTO lecture_files (lecture_id, file_name, file_url, file_type)
                                 VALUES ($1, $2, $3, $4)`,
                                [
                                    lectureId,
                                    file.originalname,
                                    file.path,
                                    file.mimetype,
                                ]
                            );
                        }

                        // Обробка відео для лекції
                        const videosForThisLecture = req.files['lecture_videos']?.slice(index, index + 1); // Вибираємо тільки одне відео для кожної лекції

                        if (videosForThisLecture && videosForThisLecture.length > 0) {
                            // Очищаємо попередні відеофайли для цієї лекції
                            await pool.query('DELETE FROM videos WHERE lecture_id = $1', [lectureId]);

                            // Вставляємо новий відеофайл для цієї лекції
                            const video = videosForThisLecture[0]; // Беремо перший відеофайл
                            await pool.query(
                                `INSERT INTO videos (lecture_id, file_name, file_path, file_size)
                                 VALUES ($1, $2, $3, $4)`,
                                [
                                    lectureId,
                                    video.originalname,
                                    video.path,
                                    video.size,
                                ]
                            );
                        }
                    });

                    await Promise.all(lecturePromises);
                }
            });

            await Promise.all(modulePromises);
        }

        // Insert tags (same logic as before)
        if (tags && Array.isArray(tags)) {
            const insertTagsQuery = `
                INSERT INTO tags (name) 
                SELECT * FROM (VALUES ${tags.map((_, i) => `($${i + 1})`).join(', ')}) AS t(name)
                ON CONFLICT(name) DO NOTHING
                RETURNING id;
            `;
            const tagIds = await pool.query(insertTagsQuery, tags);

            const courseTagPromises = tagIds.rows.map(tag => {
                return pool.query(`INSERT INTO course_tags (course_id, tag_id) VALUES ($1, $2)`, [courseId, tag.id]);
            });

            await Promise.all(courseTagPromises);
        }

        return res.json({
            success: true,
            message: 'Course created successfully!',
            courseId,
            tags,
        });
    } catch (err) {
        console.error('Error creating course:', err);
        return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
});

module.exports = router;
