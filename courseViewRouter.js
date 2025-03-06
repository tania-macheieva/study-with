const express = require('express');
const router = express.Router();
const db = require('./db');
//const fetch = require('node-fetch');
require('dotenv').config();

router.get('/course/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Оновлений запит для отримання даних курсу разом з тестами
        const query = `
            SELECT 
                c.id,
                c.name,
                c.description,
                c.test_link as course_test_link,
                m.id as module_id,
                m.title as module_title,
                m.order_num as module_order,
                m.test_link as module_test_link,
                l.id as lecture_id,
                l.title as lecture_title,
                l.description as lecture_description,
                l.order_num as lecture_order,
                lf.file_url,
                lf.file_type,
                COALESCE(lp.completed, false) as is_completed
            FROM all_courses c
            LEFT JOIN modules m ON c.id = m.course_id
            LEFT JOIN lectures l ON m.id = l.module_id
            LEFT JOIN lecture_files lf ON l.id = lf.lecture_id
            LEFT JOIN lecture_progress lp ON l.id = lp.lecture_id AND lp.user_id = $2
            WHERE c.id = $1
            ORDER BY m.order_num, l.order_num
        `;

        const result = await db.query(query, [courseId, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Форматуємо дані курсу
        const courseData = {
            id: result.rows[0].id,
            name: result.rows[0].name,
            description: result.rows[0].description,
            test_link: result.rows[0].course_test_link,
            modules: []
        };

        // Групуємо дані по модулях
        const modulesMap = new Map();

        result.rows.forEach(row => {
            if (row.module_id) {
                if (!modulesMap.has(row.module_id)) {
                    modulesMap.set(row.module_id, {
                        id: row.module_id,
                        title: row.module_title,
                        order: row.module_order,
                        test_link: row.module_test_link,
                        lectures: []
                    });
                }
                
                if (row.lecture_id) {
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
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/course/:courseId/progress', async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const progressQuery = `
            WITH course_stats AS (
                SELECT 
                    COUNT(DISTINCT l.id) as total_lectures,
                    COUNT(DISTINCT CASE WHEN lp.completed = true THEN l.id END) as completed_lectures
                FROM all_courses c
                JOIN modules m ON c.id = m.course_id
                JOIN lectures l ON m.id = l.module_id
                LEFT JOIN lecture_progress lp ON l.id = lp.lecture_id AND lp.user_id = $2
                WHERE c.id = $1
            )
            SELECT
                cs.total_lectures,
                cs.completed_lectures,
                CASE 
                    WHEN cs.total_lectures > 0 
                    THEN ROUND((cs.completed_lectures::float / cs.total_lectures::float * 100)::numeric, 2)
                    ELSE 0
                END as progress_percentage
            FROM course_stats cs
        `;

        const result = await db.query(progressQuery, [courseId, userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Прогрес не знайдено' });
        }

        const progressData = result.rows[0];
        res.json({
            progress: progressData.progress_percentage,
            totalLectures: progressData.total_lectures,
            completedLectures: progressData.completed_lectures
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

        const query = `
            INSERT INTO lecture_progress (user_id, lecture_id, completed, completed_at)
            VALUES ($1, $2, true, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, lecture_id)
            DO UPDATE SET 
                completed = true,
                completed_at = CURRENT_TIMESTAMP
            RETURNING *
        `;

        const result = await db.query(query, [userId, lectureId]);
        
        await updateCourseProgress(userId, lectureId);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Помилка оновлення прогресу лекції:', error);
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

router.get('/module/:moduleId/test', async (req, res) => {
    try {
        const { moduleId } = req.params;
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Перевіряємо чи існує тест для модуля
        const moduleQuery = `
            SELECT test_link
            FROM modules
            WHERE id = $1
        `;
        
        const moduleResult = await db.query(moduleQuery, [moduleId]);
        
        if (moduleResult.rows.length === 0 || !moduleResult.rows[0].test_link) {
            return res.status(404).json({ error: 'Test not found for this module' });
        }

        // Отримуємо контент тесту
        const testLink = moduleResult.rows[0].test_link;
        
        res.json({
            type: 'module',
            moduleId: moduleId,
            testLink: testLink
        });

    } catch (error) {
        console.error('Error loading module test:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/course/:courseId/test', async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Перевіряємо чи існує фінальний тест для курсу
        const courseQuery = `
            SELECT test_link
            FROM all_courses
            WHERE id = $1
        `;
        
        const courseResult = await db.query(courseQuery, [courseId]);
        
        if (courseResult.rows.length === 0 || !courseResult.rows[0].test_link) {
            return res.status(404).json({ error: 'Final test not found for this course' });
        }

        // Отримуємо контент тесту
        const testLink = courseResult.rows[0].test_link;
        
        res.json({
            type: 'course',
            courseId: courseId,
            testLink: testLink
        });

    } catch (error) {
        console.error('Error loading course test:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/module/:moduleId/test/submit', async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { userId, answers } = req.body;

        if (!userId || !answers) {
            return res.status(400).json({ error: 'User ID and answers are required' });
        }

        // Тут можна додати логіку для збереження результатів тесту
        // Наприклад, зберігати в окрему таблицю test_results

        res.json({
            success: true,
            message: 'Test submitted successfully'
        });

    } catch (error) {
        console.error('Error submitting test:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



router.post('/comments', async (req, res) => {
    try {
        const { content, parent_comment_id, course_id, user_id } = req.body;
        let parentUserId = null;

        if (parent_comment_id) {
            const parentCommentResult = await db.query(
                'SELECT user_id FROM comments WHERE id = $1',
                [parent_comment_id]
            );
        
            if (parentCommentResult.rows.length > 0) {
                parentUserId = parentCommentResult.rows[0].user_id;
            } else {
                return res.status(404).json({ error: 'Parent comment not found' });
            }
        } 

        // Insert the new comment along with parentUserId
        const result = await db.query(
            'INSERT INTO comments (content, parent_comment_id, course_id, user_id, parent_user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [content, parent_comment_id, course_id, user_id, parentUserId]
        );

        const newComment = result.rows[0];

        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error inserting comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

router.get('/comments', async (req, res) => {
    const { course_id } = req.query;

    if (!course_id) {
        return res.status(400).json({ error: 'Course ID is required' });
    }

    try {
        const comments = await db.query(
            `SELECT 
                c.id, 
                c.content, 
                c.created_at,
                c.parent_comment_id,
                c.user_id, 
                u.name AS user_name, 
                u.profile_image,    
                s.profile_image AS student_profile_image, 
                c2.content AS parent_comment_content,
                u2.name AS parent_username
            FROM comments c
            JOIN users u ON c.user_id = u.id
            LEFT JOIN teachers t ON u.id = t.user_id
            LEFT JOIN students s ON u.id = s.user_id
            LEFT JOIN comments c2 ON c.parent_comment_id = c2.id
            LEFT JOIN users u2 ON c2.user_id = u2.id
            WHERE c.course_id = $1
            ORDER BY c.created_at`,
            [course_id]
        );

        res.json(comments.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

router.delete('/comments/:comment_id', async (req, res) => {
    const { comment_id } = req.params;
    const { user_id } = req.body;

    // Authorization check here
    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // First, delete all child comments (replies)
        await db.query(
            'DELETE FROM comments WHERE parent_comment_id = $1 AND user_id = $2',
            [comment_id, user_id]
        );

        // Then, delete the main comment
        const result = await db.query(
            'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *',
            [comment_id, user_id]
        );

        if (result.rowCount > 0) {
            return res.status(200).json({ message: 'Comment and its replies deleted successfully' });
        } else {
            return res.status(404).json({ error: 'Comment not found or not authorized to delete' });
        }
    } catch (err) {
        console.error('Error deleting comment:', err);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

router.put('/comments/:comment_id', async (req, res) => {
    const { comment_id } = req.params;
    const { content, user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (!content) {
        return res.status(400).json({ error: 'Comment text is required' });
    }
    
    try {
        const result = await db.query(
            'SELECT * FROM comments WHERE id = $1 AND user_id = $2',
            [comment_id, user_id]
        );
    
        if (result.rowCount === 0) {
            return res.status(403).json({ error: 'Comment not found or not authorized to edit' }); // Using 403 for authorization errors
        }
    
        const updateResult = await db.query(
            'UPDATE comments SET content = $1 WHERE id = $2 RETURNING *',
            [content, comment_id]
        );
        
        if (updateResult.rowCount > 0) {
            res.status(200).json(updateResult.rows[0]);
        } else {
            res.status(500).json({ error: 'Failed to update comment' });
        }
        
    } catch (err) {
        console.error('Error updating comment:', err);
        res.status(500).json({ error: 'Database error while updating comment' });
    }
    
});

router.get('/comments/:comment_id', async (req, res) => {
    const { comment_id } = req.params;
    try {
        const result = await db.query('SELECT * FROM comments WHERE id = $1', [comment_id]);
        if (result.rowCount > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Comment not found' });
        }
    } catch (error) {
        console.error('Error fetching comment:', error);
        res.status(500).json({ error: 'Failed to fetch comment' });
    }
});

router.post('/report', async (req, res) => {
    const { currentUsername, messageId, username, messageContent} = req.body;

    // Перевірка на наявність всіх необхідних полів
    if (!currentUsername || !messageId || !username || !messageContent) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Перевірка, чи є необхідні змінні середовища
    if (!process.env.TRELLO_API_KEY || !process.env.TRELLO_TOKEN || !process.env.TRELLO_LIST_ID) {
        return res.status(500).json({ error: 'Missing Trello API configuration' });
    }

    try {
        // Створення запиту на створення картки Trello
        const response = await fetch('https://api.trello.com/1/cards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: `🚨 Report from ${currentUsername} against ${username}`,
                desc: `📜 **Message Content:** ${messageContent}\n\n🆔 **Message ID:** ${messageId}\n👤 **Reported User:** ${username}\n🕵️ **Reported by:** ${currentUsername}\n\n 📅 **Reported on:** ${new Date().toLocaleString()}`,
                
                idList: process.env.TRELLO_LIST_ID,
                key: process.env.TRELLO_API_KEY,
                token: process.env.TRELLO_TOKEN,
            }),
        });

        // Якщо запит до Trello не успішний
        if (!response.ok) {
            throw new Error('Failed to create Trello card');
        }

        // Отримання відповіді від Trello
        const data = await response.json();

        // Повернення успішної відповіді
        res.json({ message: 'Report submitted successfully', trelloCardId: data.id });
    } catch (error) {
        console.error('Error reporting message:', error);
        res.status(500).json({ error: 'Failed to report message' });
    }
});
router.get('/comments/replies/:user_id', async (req, res) => {
    const { user_id } = req.params;
    console.log(`Запит на replies для user_id: ${user_id}`);

    try {
        const query = `
            SELECT 
                c.id AS comment_id, 
                c.content, 
                c.created_at,
                c.parent_comment_id,
                u.name AS user_name, 
                u.profile_image,    
                s.profile_image AS student_profile_image, 
                c2.content AS parent_comment_content,
                u2.name AS parent_username,
                c.course_id,
                cr.name AS course_name,
                cr.image_url AS course_thumbnail 
            FROM comments c
            JOIN users u ON c.user_id = u.id
            LEFT JOIN comments c2 ON c.parent_comment_id = c2.id
            LEFT JOIN users u2 ON c2.user_id = u2.id
            LEFT JOIN students s ON u.id = s.user_id
            LEFT JOIN teachers t ON u.id = t.user_id
            JOIN all_courses cr ON c.course_id = cr.id
            WHERE EXISTS (
                SELECT 1 FROM comments WHERE id = c.parent_comment_id AND user_id = $1
            )
            ORDER BY c.created_at DESC`;

        const { rows } = await db.query(query, [user_id]);

        console.log(`Знайдено ${rows.length} відповідей`);
        res.json(rows);
    } catch (error) {
        console.error('Помилка отримання відповідей:', error);
        res.status(500).json({ error: 'Не вдалося отримати відповіді' });
    }
});
router.get('/comments/course-owner/:user_id', async (req, res) => {
    const { user_id } = req.params;
    console.log(`Запит на головні коментарі для курсів user_id: ${user_id}`);

    try {
        const query = `
            SELECT 
                c.id AS comment_id, 
                c.content, 
                c.created_at, 
                u.name AS user_name, 
                u.profile_image,
                s.profile_image AS student_profile_image, 
                c.course_id,
                cr.name AS course_name, 
                cr.image_url AS course_thumbnail
            FROM comments c
            JOIN users u ON c.user_id = u.id
            JOIN all_courses cr ON c.course_id = cr.id
            LEFT JOIN students s ON u.id = s.user_id     
            LEFT JOIN teachers t ON u.id = t.user_id  -- Переконатися, що є з'єднання з викладачами
            WHERE cr.author_id = $1 AND c.parent_comment_id IS NULL
            ORDER BY c.created_at DESC;

        `;
        const { rows } = await db.query(query, [user_id]);

        console.log(`Знайдено ${rows.length} головних коментарів`);
        res.json(rows);
    } catch (error) {
        console.error('Помилка отримання головних коментарів:', error);
        res.status(500).json({ error: 'Не вдалося отримати головні коментарі' });
    } 
});
// Додавання нової нотатки 
router.post('/notes/add', async (req, res) => {
    try {
        const { userId, courseId,  lectureId, text, videoTimecode } = req.body;

        if (!userId || !courseId || !text) {
            return res.status(400).json({ error: 'userId, courseId та text обов\'язкові' });
        }

        const result = await db.query(
            `INSERT INTO notes (userId, courseId, lectureId, text, videoTimecode, timestamp) 
             VALUES ($1, $2, $3, $4, $5,  NOW()) RETURNING *`,
            [userId, courseId,  lectureId, text, videoTimecode]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Отримання нотаток для конкретного курсу та лекції
router.get('/notes', async (req, res) => {
    try {
        const { userId, courseId, lectureId } = req.query;

        if (!userId || !courseId || !lectureId) {
            return res.status(400).json({ error: 'userId, courseId та lectureId обов\'язкові' });
        }

        const result = await db.query(
            'SELECT * FROM notes WHERE userId = $1 AND courseId = $2 AND lectureId = $3 ORDER BY timestamp DESC',
            [userId, courseId, lectureId]
        );

        res.json(result.rows); // Повертаємо всі нотатки для цієї лекції
    } catch (error) {
        console.error('Error retrieving notes:', error);
        res.status(500).json({ error: error.message });
    }
});
// Оновлення нотатки за ID
router.put('/notes/:id', async (req, res) => {
    try {
        const { id } = req.params; // Отримуємо ID нотатки з URL
        const { text } = req.body; // Отримуємо новий текст з тіла запиту

        if (!text || text.trim() === '') {
            return res.status(400).json({ error: 'Text cannot be empty' });
        }

        const result = await db.query(
            `UPDATE notes 
             SET text = $1, timestamp = NOW() 
             WHERE id = $2 
             RETURNING *`,
            [text, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({ message: 'Note updated successfully', note: result.rows[0] });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


//  Видалення нотатки за ID
router.delete('/notes/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            'DELETE FROM notes WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({ message: 'Note successfully deleted' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;