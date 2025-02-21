const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/course/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.query.userId;

        // Перевірка валідності courseId
        if (!courseId || isNaN(courseId)) {
            return res.status(400).json({ 
                error: 'Invalid course ID',
                details: 'Course ID must be a valid number'
            });
        }

        // Перевірка на наявність userId
        if (!userId) {
            return res.status(400).json({ 
                error: 'User ID is required',
                details: 'Please provide a valid user ID'
            });
        }

        const courseIdNum = parseInt(courseId, 10);

        // Перевірка, чи існує користувач з таким ID
        const userCheckQuery = 'SELECT id FROM users WHERE id = $1';
        const userCheckResult = await db.query(userCheckQuery, [userId]);

        if (userCheckResult.rows.length === 0) {
            return res.status(404).json({ 
                error: 'User not found',
                details: 'Please provide a valid user ID'
            });
        }

        // Оновлений запит з правильною обробкою статусу completed
        const courseQuery = `
            SELECT 
                c.id,
                c.name,
                c.description,
                c.author_id,
                u.name as author_name,
                m.id as module_id,
                m.title as module_title,
                m.order_num as module_order,
                l.id as lecture_id,
                l.title as lecture_title,
                l.description as lecture_description,
                l.order_num as lecture_order,
                lf.file_url,
                lf.file_type,
                COALESCE(lp.completed, false) as is_completed,
                (
                    SELECT COUNT(*)
                    FROM lectures l2
                    WHERE l2.module_id = m.id
                ) as module_total_lectures,
                (
                    SELECT COUNT(*)
                    FROM lectures l2
                    JOIN lecture_progress lp2 ON l2.id = lp2.lecture_id
                    WHERE l2.module_id = m.id AND lp2.user_id = $2 AND lp2.completed = true
                ) as module_completed_lectures
            FROM all_courses c
            LEFT JOIN users u ON c.author_id = u.id
            LEFT JOIN modules m ON c.id = m.course_id
            LEFT JOIN lectures l ON m.id = l.module_id
            LEFT JOIN lecture_files lf ON l.id = lf.lecture_id
            LEFT JOIN lecture_progress lp ON l.id = lp.lecture_id AND lp.user_id = $2
            WHERE c.id = $1
            ORDER BY m.order_num, l.order_num
        `;

        const courseResult = await db.query(courseQuery, [courseIdNum, userId]);

        if (courseResult.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Формуємо дані курсу
        const courseData = {
            id: courseResult.rows[0].id,
            name: courseResult.rows[0].name,
            description: courseResult.rows[0].description,
            author: {
                id: courseResult.rows[0].author_id,
                name: courseResult.rows[0].author_name
            },
            modules: []
        };

        // Створюємо Map для модулів
        const modulesMap = new Map();

        courseResult.rows.forEach(row => {
            if (row.module_id) {
                if (!modulesMap.has(row.module_id)) {
                    modulesMap.set(row.module_id, {
                        id: row.module_id,
                        title: row.module_title,
                        order: row.module_order,
                        lectures: []
                    });
                }
                
                if (row.lecture_id && !modulesMap.get(row.module_id).lectures.some(l => l.id === row.lecture_id)) {
                    modulesMap.get(row.module_id).lectures.push({
                        id: row.lecture_id,
                        title: row.lecture_title,
                        description: row.lecture_description,
                        order: row.lecture_order,
                        completed: row.is_completed,
                        file_url: row.file_url,
                        file_type: row.file_type
                    });
                }
            }
        });

        // Конвертуємо Map в масив і сортуємо модулі та лекції
        courseData.modules = Array.from(modulesMap.values())
            .sort((a, b) => a.order - b.order);

        courseData.modules.forEach(module => {
            module.lectures.sort((a, b) => a.order - b.order);
        });

        res.json(courseData);
    } catch (error) {
        console.error('Error loading course data:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
});

router.get('/course/:courseId/progress', async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Оновлений SQL запит для правильного розрахунку прогресу
        const progressQuery = `
            WITH lecture_counts AS (
                SELECT 
                    c.id as course_id,
                    COUNT(DISTINCT l.id) as total_lectures,
                    COUNT(DISTINCT CASE WHEN lp.completed = true THEN l.id END) as completed_lectures
                FROM all_courses c
                JOIN modules m ON c.id = m.course_id
                JOIN lectures l ON m.id = l.module_id
                LEFT JOIN lecture_progress lp ON l.id = lp.lecture_id AND lp.user_id = $2
                WHERE c.id = $1
                GROUP BY c.id
            )
            UPDATE enrollments e
            SET progress = (
                SELECT 
                    CASE 
                        WHEN lc.total_lectures > 0 
                        THEN ROUND((lc.completed_lectures::float / lc.total_lectures * 100)::numeric, 2)
                        ELSE 0 
                    END
                FROM lecture_counts lc
            )
            WHERE e.course_id = $1 AND e.user_id = $2
            RETURNING progress, 
                (SELECT total_lectures FROM lecture_counts) as total_lectures,
                (SELECT completed_lectures FROM lecture_counts) as completed_lectures;
        `;

        const result = await db.query(progressQuery, [courseId, userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Прогрес не знайдено' });
        }

        const progressData = result.rows[0];
        res.json({
            progress: progressData.progress,
            totalLectures: parseInt(progressData.total_lectures),
            completedLectures: parseInt(progressData.completed_lectures)
        });
    } catch (error) {
        console.error('Помилка отримання прогресу:', error);
        res.status(500).json({ error: 'Внутрішня помилка сервера' });
    }
});

router.post('/lecture/:lectureId/complete', async (req, res) => {
    try {
        const { lectureId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Спочатку оновлюємо статус лекції
        const updateLectureQuery = `
            INSERT INTO lecture_progress (user_id, lecture_id, completed, completed_at)
            VALUES ($1, $2, true, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, lecture_id)
            DO UPDATE SET 
                completed = true,
                completed_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;

        await db.query(updateLectureQuery, [userId, lectureId]);

        // Тепер оновлюємо загальний прогрес курсу
        const updateProgressQuery = `
            WITH course_info AS (
                SELECT 
                    c.id as course_id
                FROM all_courses c
                JOIN modules m ON c.id = m.course_id
                JOIN lectures l ON m.id = l.module_id
                WHERE l.id = $2
            ),
            lecture_counts AS (
                SELECT 
                    c.id as course_id,
                    COUNT(DISTINCT l.id) as total_lectures,
                    COUNT(DISTINCT CASE WHEN lp.completed = true THEN l.id END) as completed_lectures
                FROM all_courses c
                JOIN modules m ON c.id = m.course_id
                JOIN lectures l ON m.id = l.module_id
                LEFT JOIN lecture_progress lp ON l.id = lp.lecture_id AND lp.user_id = $1
                WHERE c.id = (SELECT course_id FROM course_info)
                GROUP BY c.id
            )
            UPDATE enrollments e
            SET progress = (
                SELECT 
                    CASE 
                        WHEN lc.total_lectures > 0 
                        THEN ROUND((lc.completed_lectures::float / lc.total_lectures * 100)::numeric, 2)
                        ELSE 0 
                    END
                FROM lecture_counts lc
            )
            WHERE e.course_id = (SELECT course_id FROM course_info)
            AND e.user_id = $1
            RETURNING progress;
        `;

        const result = await db.query(updateProgressQuery, [userId, lectureId]);
        res.json({ 
            success: true, 
            progress: result.rows[0].progress 
        });
    } catch (error) {
        console.error('Помилка оновлення прогресу:', error);
        res.status(500).json({ error: 'Внутрішня помилка сервера' });
    }
});

async function updateCourseProgress(userId, lectureId) {
    const query = `
        WITH course_stats AS (
            SELECT 
                c.id as course_id,
                COUNT(DISTINCT l.id) as total_lectures,
                COUNT(DISTINCT CASE WHEN lp.completed = true THEN l.id END) as completed_lectures
            FROM lectures l
            JOIN modules m ON l.module_id = m.id
            JOIN all_courses c ON m.course_id = c.id
            LEFT JOIN lecture_progress lp ON l.id = lp.lecture_id AND lp.user_id = $1
            WHERE l.id = $2
            GROUP BY c.id
        )
        UPDATE enrollments e
        SET progress = (cs.completed_lectures::float / cs.total_lectures * 100)
        FROM course_stats cs
        WHERE e.course_id = cs.course_id AND e.user_id = $1
    `;

    await db.query(query, [userId, lectureId]);
}

router.post('/progress/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const { progress, userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const updateQuery = `
            UPDATE enrollments 
            SET progress = $1, last_accessed = CURRENT_TIMESTAMP
            WHERE course_id = $2 AND user_id = $3
            RETURNING *
        `;
        
        const result = await db.query(updateQuery, [progress, courseId, userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Запис про проходження курсу не знайдено' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Помилка оновлення прогресу:', error);
        res.status(500).json({ error: 'Внутрішня помилка сервера' });
    }
});

router.get('/lecture/:lectureId/content', async (req, res) => {
    try {
        const { lectureId } = req.params;
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const lectureQuery = `
            SELECT 
                l.id,
                l.title,
                l.description,
                lf.file_url,
                lf.file_type,
                l.content,
                m.id as module_id,
                m.title as module_title
            FROM lectures l
            LEFT JOIN lecture_files lf ON l.id = lf.lecture_id
            JOIN modules m ON l.module_id = m.id
            WHERE l.id = $1
        `;

        const result = await db.query(lectureQuery, [lectureId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Лекцію не знайдено' });
        }

        const lectureData = {
            id: result.rows[0].id,
            title: result.rows[0].title,
            description: result.rows[0].description,
            content: result.rows[0].content,
            contentType: result.rows[0].file_type || 'text',
            videoUrl: result.rows[0].file_url,
            moduleId: result.rows[0].module_id,
            moduleTitle: result.rows[0].module_title
        };

        res.json(lectureData);
    } catch (error) {
        console.error('Помилка отримання контенту лекції:', error);
        res.status(500).json({ error: 'Внутрішня помилка сервера' });
    }
});

router.get('/lecture/:lectureId', async (req, res) => {
    try {
        const { lectureId } = req.params;
        const userId = req.query.userId;

        const query = `
            SELECT 
                l.id,
                l.title,
                l.description,
                l.order_num,
                lf.file_url,
                lf.file_type,
                COALESCE(lp.completed, false) as is_completed
            FROM lectures l
            LEFT JOIN lecture_files lf ON l.id = lf.lecture_id
            LEFT JOIN lecture_progress lp ON l.id = lp.lecture_id AND lp.user_id = $2
            WHERE l.id = $1
        `;

        const result = await db.query(query, [lectureId, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lecture not found' });
        }

        const lectureData = {
            id: result.rows[0].id,
            title: result.rows[0].title,
            description: result.rows[0].description,
            file_type: result.rows[0].file_type,
            file_url: result.rows[0].file_url,
            is_completed: result.rows[0].is_completed
        };

        res.json(lectureData);
    } catch (error) {
        console.error('Error fetching lecture:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


///////////////////////
///// COMMENTS ///////
/////////////////////   
router.post('/comments', async (req, res) => {
    const { courseId, userId, parentCommentId, content } = req.body;

    // Перевірка на наявність обов'язкових полів
    if (!courseId || !userId || !content) {
        console.error('Missing fields:', { courseId, userId, content });
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const insertCommentQuery = `
            INSERT INTO comments (course_id, user_id, parent_comment_id, text)
            VALUES ($1, $2, $3, $4)
            RETURNING id, user_id, text, created_at;
        `;
        const values = [courseId, userId, parentCommentId || null, content];
        console.log('Executing query with values:', values);  // Логування значень перед виконанням запиту

        const result = await db.query(insertCommentQuery, values);

        const newComment = result.rows[0];
        console.log('Comment created successfully:', newComment);  // Логування успіху створення

        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error during comment creation:', error);  // Логування помилки
        res.status(500).json({ error: 'Internal server error' });
    }
});




// router.get('/course/:courseId/comments', async (req, res) => {
//     const { courseId } = req.params;
//     console.log(`Fetching comments for courseId: ${courseId}`);  // Лог для відлагодження

//     try {
//         const commentsQuery = `
//             SELECT u.profile_image, c.*
//             FROM comments c
//             JOIN users u ON u.id = c.user_id
//             WHERE c.course_id = $1
//         `;
//         const commentsResult = await db.query(commentsQuery, [courseId]);

//         if (commentsResult.rows.length === 0) {
//             return res.status(404).json({ error: 'No comments found' });  // Повертаємо JSON
//         }

//         res.json(commentsResult.rows);  // Повертаємо JSON
//     } catch (error) {
//         console.error('Error fetching comments:', error);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

router.get('/course/:courseId', async (req, res) => {
    const { courseId } = req.params;
    console.log(`Fetching comments for courseId: ${courseId}`);  // Лог для відлагодження

    try {
        const commentsQuery = `
            SELECT u.profile_image, c.*
            FROM comments c
            JOIN users u ON u.id = c.user_id
            WHERE c.course_id = $1
        `;
        const commentsResult = await db.query(commentsQuery, [courseId]);

        if (commentsResult.rows.length === 0) {
            return res.status(404).json({ error: 'No comments found' });
        }

        res.json(commentsResult.rows);  // Повертаємо JSON
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});


router.post('/comments/reply', async (req, res) => {
    const { userId, parentId, text, date } = req.body;
    try {
        // Assuming the reply is inserted into the database
        const result = await db.query('INSERT INTO comments (user_id, parent_id, text, created_at) VALUES ($1, $2, $3, $4) RETURNING *', [userId, parentId, text, date]);
        const savedReply = result.rows[0];  // Assuming your database returns the saved reply
        res.json(savedReply);
    } catch (error) {
        console.error('Error saving reply:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// router.get('/api/course/:courseId/comments', async (req, res) => {
//     const { courseId } = req.params;
//     try {
//         const comments = await getCommentsForCourse(courseId); // Your function to fetch comments
//         res.json(comments);
//     } catch (error) {
//         console.error('Error fetching comments:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });


module.exports = router;