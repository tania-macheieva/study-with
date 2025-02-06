const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/course/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.query.userId;
        
        console.log('Отримано запит на курс:', { courseId, userId }); // Додаємо логування

        if (!courseId || isNaN(courseId)) {
            console.log('Неправильний ID курсу:', courseId);
            return res.status(400).json({ 
                error: 'Invalid course ID',
                details: 'Course ID must be a valid number'
            });
        }

        if (!userId) {
            console.log('Відсутній ID користувача');
            return res.status(400).json({ 
                error: 'User ID is required',
                details: 'Please provide a valid user ID'
            });
        }

        const courseIdNum = parseInt(courseId, 10);
        
        console.log('Виконуємо запит до бази даних...'); // Додаємо логування

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
                COALESCE(lp.completed, false) as is_completed
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

        console.log('Результат запиту:', courseResult.rows); // Додаємо логування

        if (courseResult.rows.length === 0) {
            console.log('Курс не знайдено');
            return res.status(404).json({ error: 'Курс не знайдено' });
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

        // Групуємо лекції по модулях
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

        courseData.modules = Array.from(modulesMap.values())
            .sort((a, b) => a.order - b.order);

        courseData.modules.forEach(module => {
            module.lectures.sort((a, b) => a.order - b.order);
        });

        console.log('Відправляємо дані курсу:', courseData); // Додаємо логування

        res.json(courseData);
    } catch (error) {
        console.error('Детальна помилка отримання даних курсу:', error);
        res.status(500).json({ 
            error: 'Внутрішня помилка сервера',
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

        const progressQuery = `
            SELECT 
                e.progress,
                e.last_accessed,
                COUNT(DISTINCT l.id) as total_lectures,
                COUNT(DISTINCT CASE WHEN lp.completed = true THEN l.id END) as completed_lectures
            FROM enrollments e
            JOIN all_courses c ON e.course_id = c.id
            JOIN modules m ON c.id = m.course_id
            JOIN lectures l ON m.id = l.module_id
            LEFT JOIN lecture_progress lp ON l.id = lp.lecture_id AND lp.user_id = e.user_id
            WHERE e.course_id = $1 AND e.user_id = $2
            GROUP BY e.progress, e.last_accessed
        `;

        const result = await db.query(progressQuery, [courseId, userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Прогрес не знайдено' });
        }

        const progress = result.rows[0];
        res.json({
            progress: progress.progress,
            lastAccessed: progress.last_accessed,
            totalLectures: progress.total_lectures,
            completedLectures: progress.completed_lectures
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

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching lecture:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;