const express = require('express');
const router = express.Router();
const db = require('./db');
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

router.get('/course/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Оновлений запит для отримання даних курсу разом з тестами та їх статусом
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
                COALESCE(lp.completed, false) as is_lecture_completed,
                -- Статус завершення модульного тесту
                COALESCE(tp_module.completed, false) as is_module_test_completed,
                -- Статус завершення фінального тесту
                COALESCE(tp_course.completed, false) as is_course_test_completed
            FROM all_courses c
            LEFT JOIN modules m ON c.id = m.course_id
            LEFT JOIN lectures l ON m.id = l.module_id
            LEFT JOIN lecture_files lf ON l.id = lf.lecture_id
            LEFT JOIN lecture_progress lp ON l.id = lp.lecture_id AND lp.user_id = $2
            -- Приєднуємо прогрес модульних тестів
            LEFT JOIN test_progress tp_module ON m.id = tp_module.module_id 
                AND tp_module.user_id = $2 
                AND tp_module.test_type = 'module'
            -- Приєднуємо прогрес фінального тесту
            LEFT JOIN test_progress tp_course ON c.id = tp_course.course_id 
                AND tp_course.user_id = $2 
                AND tp_course.test_type = 'course'
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
            is_course_test_completed: result.rows[0].is_course_test_completed,
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
                        is_module_test_completed: row.is_module_test_completed,
                        lectures: []
                    });
                }
                
                if (row.lecture_id) {
                    modulesMap.get(row.module_id).lectures.push({
                        id: row.lecture_id,
                        title: row.lecture_title,
                        description: row.lecture_description,
                        order: row.lecture_order,
                        completed: row.is_lecture_completed,
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

        // Спочатку перевіряємо, чи має курс фінальний тест
        const courseQuery = `SELECT test_link FROM all_courses WHERE id = $1`;
        const courseResult = await db.query(courseQuery, [courseId]);
        
        if (courseResult.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        
        // ВИПРАВЛЕННЯ: Правильно визначаємо наявність фінального тесту
        const hasFinalTest = courseResult.rows[0].test_link !== null && 
                            courseResult.rows[0].test_link !== '' && 
                            courseResult.rows[0].test_link !== undefined;

        // Оновлений запит для підрахунку прогресу з урахуванням тестів
        const progressQuery = `
            WITH course_stats AS (
                -- Підрахунок загальної кількості лекцій
                SELECT 
                    COUNT(DISTINCT l.id) as total_lectures,
                    COUNT(DISTINCT CASE WHEN lp.completed = true THEN l.id END) as completed_lectures,
                    -- Підрахунок кількості модулів з тестами
                    COUNT(DISTINCT CASE WHEN m.test_link IS NOT NULL AND m.test_link != '' THEN m.id END) as total_module_tests,
                    -- Підрахунок кількості пройдених тестів модулів
                    COUNT(DISTINCT CASE WHEN tp_module.completed = true THEN m.id END) as completed_module_tests,
                    -- Перевірка наявності фінального тесту
                    ${hasFinalTest ? "1" : "0"} as has_final_test,
                    -- Перевірка пройденості фінального тесту
                    MAX(CASE WHEN tp_course.completed = true THEN 1 ELSE 0 END) as completed_final_test
                FROM all_courses c
                JOIN modules m ON c.id = m.course_id
                JOIN lectures l ON m.id = l.module_id
                LEFT JOIN lecture_progress lp ON l.id = lp.lecture_id AND lp.user_id = $2
                -- Приєднуємо прогрес по тестам модулів
                LEFT JOIN test_progress tp_module ON m.id = tp_module.module_id 
                    AND tp_module.user_id = $2 
                    AND tp_module.test_type = 'module'
                -- Приєднуємо прогрес по фінальному тесту
                LEFT JOIN test_progress tp_course ON c.id = tp_course.course_id 
                    AND tp_course.user_id = $2 
                    AND tp_course.test_type = 'course'
                WHERE c.id = $1
            )
            SELECT
                cs.total_lectures,
                cs.completed_lectures,
                cs.total_module_tests,
                cs.completed_module_tests,
                cs.has_final_test,
                cs.completed_final_test,
                -- Загальна кількість "елементів" курсу: лекції + тести модулів + фінальний тест (якщо є)
                (cs.total_lectures + cs.total_module_tests + cs.has_final_test) as total_items,
                -- Загальна кількість завершених "елементів"
                (cs.completed_lectures + cs.completed_module_tests + cs.completed_final_test) as completed_items,
                -- Розрахунок відсотка прогресу
                CASE 
                    WHEN (cs.total_lectures + cs.total_module_tests + cs.has_final_test) > 0 
                    THEN ROUND(((cs.completed_lectures + cs.completed_module_tests + cs.completed_final_test)::float / 
                          (cs.total_lectures + cs.total_module_tests + cs.has_final_test)::float * 100)::numeric, 2)
                    ELSE 0
                END as progress_percentage
            FROM course_stats cs
        `;

        const result = await db.query(progressQuery, [courseId, userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Прогрес не знайдено' });
        }

        const progressData = result.rows[0];
        
        // Отримуємо список завершених лекцій для клієнтської частини
        const completedLecturesQuery = `
            SELECT lecture_id
            FROM lecture_progress
            WHERE user_id = $1 AND completed = true
        `;
        
        const completedLecturesResult = await db.query(completedLecturesQuery, [userId]);
        const completedLectures = completedLecturesResult.rows.map(row => row.lecture_id);
        
        res.json({
            progress: progressData.progress_percentage,
            totalItems: progressData.total_items,
            completedItems: progressData.completed_items,
            totalLectures: progressData.total_lectures,
            completedLectures: progressData.completed_lectures,
            totalModuleTests: progressData.total_module_tests,
            completedModuleTests: progressData.completed_module_tests,
            hasFinalTest: progressData.has_final_test === 1,
            completedFinalTest: progressData.completed_final_test === 1,
            completedLectureIds: completedLectures
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

        // Перевірка, чи існує лекція з таким ID
        const lectureCheckQuery = 'SELECT id FROM lectures WHERE id = $1';
        const lectureCheckResult = await db.query(lectureCheckQuery, [lectureId]);
        
        if (lectureCheckResult.rows.length === 0) {
            console.error(`Лекція з ID=${lectureId} не знайдена в базі даних`);
            return res.status(404).json({ error: 'Lecture not found' });
        }

        // Також перевіряємо, чи існує вказаний користувач
        const userCheckQuery = 'SELECT id FROM users WHERE id = $1';
        const userCheckResult = await db.query(userCheckQuery, [userId]);
        
        if (userCheckResult.rows.length === 0) {
            console.error(`Користувач з ID=${userId} не знайдений в базі даних`);
            return res.status(404).json({ error: 'User not found' });
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
        
        // Отримуємо ID курсу через модуль для цієї лекції
        const courseIdQuery = `
            SELECT m.course_id
            FROM lectures l
            JOIN modules m ON l.module_id = m.id
            WHERE l.id = $1
        `;
        
        const courseIdResult = await db.query(courseIdQuery, [lectureId]);
        
        if (courseIdResult.rows.length > 0) {
            const courseId = courseIdResult.rows[0].course_id;
            console.log(`Знайдено курс з ID=${courseId} для лекції з ID=${lectureId}`);
            
            // Оновлюємо прогрес курсу
            await updateCourseProgress(userId, courseId);
        } else {
            console.error(`Не знайдено курс для лекції з ID=${lectureId}`);
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Помилка оновлення прогресу лекції:', error);
        res.status(500).json({ error: 'Внутрішня помилка сервера' });
    }
});

// Знаходимо і виправляємо функцію updateCourseProgress в courseViewRouter.js

async function updateCourseProgress(userId, courseId) {
    try {
        console.log(`Оновлення прогресу курсу для userId=${userId}, courseId=${courseId}`);
        
        // Визначаємо тип параметра courseId та корегуємо якщо потрібно
        let actualCourseId = courseId;
        
        // Якщо courseId - це ID лекції, отримуємо ID курсу через модуль
        if (isNaN(parseInt(courseId))) {
            console.log('courseId не є числом, намагаємося визначити ID курсу через лекцію');
            const lectureResult = await db.query(
                `SELECT m.course_id 
                 FROM lectures l
                 JOIN modules m ON l.module_id = m.id
                 WHERE l.id = $1`,
                [courseId]
            );
            
            if (lectureResult.rows.length > 0) {
                actualCourseId = lectureResult.rows[0].course_id;
                console.log(`Визначено courseId=${actualCourseId} через лекцію з ID=${courseId}`);
            } else {
                console.error(`Не вдалося визначити courseId через лекцію з ID=${courseId}`);
                return;
            }
        }
        
        // ВАЖЛИВО: Перевіряємо, чи існує вказаний курс у базі даних перед продовженням
        const courseCheckQuery = `SELECT id, test_link FROM all_courses WHERE id = $1`;
        const courseCheckResult = await db.query(courseCheckQuery, [actualCourseId]);
        
        if (courseCheckResult.rows.length === 0) {
            console.error(`Курс з ID=${actualCourseId} не знайдено в базі даних. Оновлення прогресу неможливе.`);
            return; // Виходимо з функції, щоб уникнути помилок FK
        }
        
        // Перевіряємо, чи є фінальний тест для цього курсу
        // ВИПРАВЛЕННЯ: правильно перевіряємо наявність фінального тесту
        const hasFinalTest = courseCheckResult.rows[0].test_link !== null && 
                            courseCheckResult.rows[0].test_link !== '' && 
                            courseCheckResult.rows[0].test_link !== undefined;
        
        console.log(`Фінальний тест для курсу ${actualCourseId}: ${hasFinalTest ? 'є' : 'відсутній'}`);
        
        // Перевіряємо чи є якісь модулі для цього курсу
        const moduleCheckQuery = `SELECT COUNT(*) as modules_count FROM modules WHERE course_id = $1`;
        const moduleCheckResult = await db.query(moduleCheckQuery, [actualCourseId]);
        
        if (moduleCheckResult.rows[0].modules_count === 0) {
            console.error(`Курс з ID=${actualCourseId} не має жодного модуля. Оновлення прогресу неможливе.`);
            return; // Виходимо з функції, оскільки у курсу немає модулів
        }
        
        // Отримуємо дані про завершені лекції, модульні тести і фінальний тест
        // ВИПРАВЛЕННЯ: використовуємо hasFinalTest для правильного розрахунку прогресу
        const progressQuery = `
            WITH course_stats AS (
                SELECT 
                    COUNT(DISTINCT l.id) as total_lectures,
                    COUNT(DISTINCT CASE WHEN lp.completed = true THEN l.id END) as completed_lectures,
                    COUNT(DISTINCT CASE WHEN m.test_link IS NOT NULL AND m.test_link != '' THEN m.id END) as total_module_tests,
                    COUNT(DISTINCT CASE WHEN tp_module.completed = true THEN m.id END) as completed_module_tests,
                    ${hasFinalTest ? "1" : "0"} as has_final_test,
                    MAX(CASE WHEN tp_course.completed = true THEN 1 ELSE 0 END) as completed_final_test
                FROM all_courses c
                JOIN modules m ON c.id = m.course_id
                JOIN lectures l ON m.id = l.module_id
                LEFT JOIN lecture_progress lp ON l.id = lp.lecture_id AND lp.user_id = $1
                LEFT JOIN test_progress tp_module ON m.id = tp_module.module_id 
                    AND tp_module.user_id = $1 
                    AND tp_module.test_type = 'module'
                LEFT JOIN test_progress tp_course ON c.id = tp_course.course_id 
                    AND tp_course.user_id = $1 
                    AND tp_course.test_type = 'course'
                WHERE c.id = $2
            )
            SELECT
                cs.total_lectures,
                cs.completed_lectures,
                cs.total_module_tests,
                cs.completed_module_tests,
                cs.has_final_test,
                cs.completed_final_test,
                (cs.total_lectures + cs.total_module_tests + cs.has_final_test) as total_items,
                (cs.completed_lectures + cs.completed_module_tests + cs.completed_final_test) as completed_items,
                CASE 
                    WHEN (cs.total_lectures + cs.total_module_tests + cs.has_final_test) > 0 
                    THEN ROUND(((cs.completed_lectures + cs.completed_module_tests + cs.completed_final_test)::float / 
                          (cs.total_lectures + cs.total_module_tests + cs.has_final_test)::float * 100)::numeric, 2)
                    ELSE 0
                END as progress_percentage
            FROM course_stats cs
        `;

        console.log(`Виконуємо запит для отримання прогресу: userId=${userId}, courseId=${actualCourseId}`);
        const result = await db.query(progressQuery, [userId, actualCourseId]);
        
        if (result.rows.length > 0) {
            const progressData = result.rows[0];
            console.log('Отримано дані прогресу:', progressData);
            
            // Значення прогресу у відсотках (округлене)
            let progressPercentage = Math.round(parseFloat(progressData.progress_percentage || 0));
            console.log(`Розрахований прогрес: ${progressPercentage}%`);
            
            // Перевіряємо, чи є запис в таблиці enrollments
            const checkEnrollmentQuery = `
                SELECT id FROM enrollments 
                WHERE user_id = $1 AND course_id = $2
            `;
            const enrollmentResult = await db.query(checkEnrollmentQuery, [userId, actualCourseId]);
            
            if (enrollmentResult.rows.length === 0) {
                console.log(`Створюємо новий запис в enrollments: userId=${userId}, courseId=${actualCourseId}`);
                // Створюємо запис, якщо його немає
                const insertQuery = `
                    INSERT INTO enrollments (user_id, course_id, enrollment_date, status, progress, last_accessed)
                    VALUES ($1, $2, CURRENT_TIMESTAMP, 'active', $3, CURRENT_TIMESTAMP)
                `;
                await db.query(insertQuery, [
                    userId, 
                    actualCourseId, 
                    progressPercentage
                ]);
            } else {
                console.log(`Оновлюємо існуючий запис в enrollments: userId=${userId}, courseId=${actualCourseId}`);
                // Оновлюємо існуючий запис
                const updateQuery = `
                    UPDATE enrollments 
                    SET progress = $1, last_accessed = CURRENT_TIMESTAMP
                    WHERE user_id = $2 AND course_id = $3
                `;
                
                await db.query(updateQuery, [
                    progressPercentage, 
                    userId, 
                    actualCourseId
                ]);
            }
            
            console.log(`Прогрес успішно оновлено: ${progressPercentage}%`);
        } else {
            console.error(`Не знайдено даних про прогрес: userId=${userId}, courseId=${actualCourseId}`);
        }
    } catch (error) {
        console.error('Помилка оновлення прогресу курсу:', error);
    }
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
            SELECT test_link, course_id
            FROM modules
            WHERE id = $1
        `;
        
        const moduleResult = await db.query(moduleQuery, [moduleId]);
        
        if (moduleResult.rows.length === 0 || !moduleResult.rows[0].test_link) {
            return res.status(404).json({ error: 'Test not found for this module' });
        }

        // Отримуємо ID курсу та посилання на тест
        const courseId = moduleResult.rows[0].course_id;
        let testLink = moduleResult.rows[0].test_link;
        
        // Створюємо об'єкт з інформацією про тест
        const testInfo = {
            type: 'module',
            moduleId: parseInt(moduleId),
            courseId: parseInt(courseId)
        };
        
        // Шифруємо інформацію про тест
        const encryptedTestInfo = encryptTestInfo(testInfo);
        
        // Перевіряємо чи testLink вже має параметри запиту
        const hasQueryParams = testLink.includes('?');
        const separator = hasQueryParams ? '&' : '?';
        
        // Додаємо параметр testId до посилання на тест
        const testLinkWithId = `${testLink}${separator}testId=${encodeURIComponent(encryptedTestInfo)}`;
        
        res.json({
            type: 'module',
            moduleId: moduleId,
            testLink: testLinkWithId
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

        // Отримуємо посилання на тест
        let testLink = courseResult.rows[0].test_link;
        
        // Створюємо об'єкт з інформацією про тест
        const testInfo = {
            type: 'course',
            courseId: parseInt(courseId)
        };
        
        // Шифруємо інформацію про тест
        const encryptedTestInfo = encryptTestInfo(testInfo);
        
        // Перевіряємо чи testLink вже має параметри запиту
        const hasQueryParams = testLink.includes('?');
        const separator = hasQueryParams ? '&' : '?';
        
        // Додаємо параметр testId до посилання на тест
        const testLinkWithId = `${testLink}${separator}testId=${encodeURIComponent(encryptedTestInfo)}`;
        
        res.json({
            type: 'course',
            courseId: courseId,
            testLink: testLinkWithId
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

router.post('/module/:moduleId/test/complete', async (req, res) => {
    const { moduleId } = req.params;
    const { userId, score = 100, courseId } = req.body;
    
    console.log(`Отримано запит на завершення тесту модуля:`, {
        moduleId,
        userId,
        score,
        courseId
    });
    
    if (!userId || !moduleId) {
        console.error('Відсутній userId або moduleId');
        return res.status(400).json({ error: 'User ID and Module ID are required' });
    }
    
    try {
        // Отримуємо course_id для цього модуля, якщо він не був переданий в запиті
        let actualCourseId = courseId;
        
        if (!actualCourseId) {
            const moduleResult = await db.query(
                'SELECT course_id FROM modules WHERE id = $1',
                [moduleId]
            );
            
            if (moduleResult.rows.length === 0) {
                console.error(`Модуль з id=${moduleId} не знайдено в базі даних`);
                return res.status(404).json({ error: 'Module not found' });
            }
            
            actualCourseId = moduleResult.rows[0].course_id;
        }
        
        console.log(`Визначено courseId: ${actualCourseId} для модуля: ${moduleId}`);
        
        // Перевіряємо на існуючі записи для конкретного модуля
        const checkQuery = `
            SELECT * FROM test_progress 
            WHERE user_id = $1 
            AND module_id = $2 
            AND test_type = 'module'
        `;
        const existingResult = await db.query(checkQuery, [userId, moduleId]);
        
        if (existingResult.rows.length > 0) {
            // Оновлюємо існуючий запис
            console.log(`Оновлюємо існуючий запис з id=${existingResult.rows[0].id}`);
            const updateQuery = `
                UPDATE test_progress 
                SET completed = true, 
                    completed_at = NOW(), 
                    score = $1,
                    course_id = $2  
                WHERE id = $3 
                RETURNING *
            `;
            await db.query(updateQuery, [score, actualCourseId, existingResult.rows[0].id]);
        } else {
            // Створюємо новий запис, без попереднього видалення
            console.log(`Створюємо новий запис для test_progress`);
            const insertQuery = `
                INSERT INTO test_progress 
                (user_id, module_id, course_id, test_type, completed, score, completed_at) 
                VALUES ($1, $2, $3, 'module', true, $4, NOW()) 
                ON CONFLICT (user_id, module_id, test_type) DO UPDATE
                SET completed = true, completed_at = NOW(), score = $4, course_id = $3
                RETURNING *
            `;
            await db.query(insertQuery, [userId, moduleId, actualCourseId, score]);
        }
        
        // Додатково перевіряємо, чи запис був успішно створений/оновлений
        const verifyQuery = `
            SELECT * FROM test_progress 
            WHERE user_id = $1 
            AND module_id = $2 
            AND test_type = 'module'
        `;
        const verifyResult = await db.query(verifyQuery, [userId, moduleId]);
        
        if (verifyResult.rows.length === 0) {
            console.error('Помилка: запис не був створений/оновлений');
            throw new Error('Failed to save test progress');
        }
        
        console.log('Запис успішно збережено:', verifyResult.rows[0]);
        
        // Оновлюємо загальний прогрес курсу
        await updateCourseProgress(userId, actualCourseId);
        
        // Відправляємо успішну відповідь
        res.status(200).json({ 
            success: true, 
            message: 'Test completed successfully',
            data: verifyResult.rows[0]
        });
    } catch (error) {
        console.error('Помилка завершення модульного тесту:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/course/:courseId/test/complete', async (req, res) => {
    try {
        const { courseId } = req.params;
        const { userId, score = 0 } = req.body;

        console.log(`Отримано запит на завершення фінального тесту: courseId=${courseId}, userId=${userId}, score=${score}`);

        if (!userId) {
            console.error('Не вказано userId');
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Перевіряємо, чи існує курс і чи має він фінальний тест
        const courseCheck = await db.query(
            'SELECT id, test_link FROM all_courses WHERE id = $1',
            [courseId]
        );

        if (courseCheck.rows.length === 0) {
            console.error(`Курс з ID=${courseId} не знайдено`);
            return res.status(404).json({ error: 'Course not found' });
        }
        
        // Перевіряємо, чи є фінальний тест для курсу
        if (!courseCheck.rows[0].test_link) {
            console.error(`Для курсу з ID=${courseId} немає фінального тесту`);
            return res.status(404).json({ error: 'No final test for this course' });
        }

        console.log(`Зберігаємо результат тесту: courseId=${courseId}, userId=${userId}, score=${score}`);

        try {
            // Спочатку видаляємо існуючий запис, якщо такий є
            await db.query(
                'DELETE FROM test_progress WHERE user_id = $1 AND course_id = $2 AND test_type = $3',
                [userId, courseId, 'course']
            );
            console.log('Успішно видалено попередні записи про проходження тесту (якщо вони були)');
        } catch (deleteError) {
            console.error('Помилка при видаленні попереднього запису:', deleteError);
            // Продовжуємо виконання, навіть якщо видалення не вдалося
        }

        try {
            // Додаємо новий запис
            const insertQuery = `
                INSERT INTO test_progress (user_id, course_id, test_type, completed, completed_at, score)
                VALUES ($1, $2, 'course', true, CURRENT_TIMESTAMP, $3)
                RETURNING *
            `;
            const result = await db.query(insertQuery, [userId, courseId, score]);
            
            if (result.rows.length === 0) {
                console.error('Не вдалося зберегти результат тесту');
                return res.status(500).json({ error: 'Failed to save test result' });
            }
            
            console.log('Результат тесту збережено:', result.rows[0]);

            // Явно оновлюємо загальний прогрес курсу
            await updateCourseProgress(userId, courseId);
            
            // Додатково перевіряємо, що прогрес був оновлений
            const progressCheck = await db.query(
                'SELECT progress FROM enrollments WHERE user_id = $1 AND course_id = $2',
                [userId, courseId]
            );
            
            if (progressCheck.rows.length > 0) {
                console.log(`Поточний прогрес курсу: ${progressCheck.rows[0].progress}%`);
            } else {
                console.warn(`Запис про проходження курсу не знайдено: userId=${userId}, courseId=${courseId}`);
            }

            res.json(result.rows[0]);
        } catch (insertError) {
            console.error('Помилка при додаванні нового запису:', insertError);
            
            // Якщо не вдалося додати новий запис через UNIQUE обмеження або інші помилки,
            // спробуємо оновити існуючий запис через UPDATE
            try {
                const updateQuery = `
                    UPDATE test_progress 
                    SET completed = true, 
                        completed_at = CURRENT_TIMESTAMP, 
                        score = $3
                    WHERE user_id = $1 
                      AND course_id = $2 
                      AND test_type = 'course'
                    RETURNING *
                `;
                const updateResult = await db.query(updateQuery, [userId, courseId, score]);
                
                if (updateResult.rows.length > 0) {
                    console.log('Запис про тест оновлено через UPDATE:', updateResult.rows[0]);
                    
                    // Оновлюємо прогрес курсу
                    await updateCourseProgress(userId, courseId);
                    
                    res.json(updateResult.rows[0]);
                } else {
                    throw new Error('Не вдалося оновити існуючий запис');
                }
            } catch (updateError) {
                console.error('Помилка при оновленні існуючого запису:', updateError);
                throw updateError; // Прокидаємо помилку далі для обробки в основному catch
            }
        }
    } catch (error) {
        console.error('Помилка оновлення прогресу фінального тесту:', error);
        res.status(500).json({ error: 'Внутрішня помилка сервера' });
    }
});

router.post('/course/:courseId/review', async (req, res) => {
    try {
        const { courseId } = req.params;
        const { userId, rating, review } = req.body;

        if (!userId || !rating || !review) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const checkQuery = `
            SELECT id FROM reviews 
            WHERE course_id = $1 AND user_id = $2
        `;
        const checkResult = await db.query(checkQuery, [courseId, userId]);
        
        let result;
        if (checkResult.rows.length > 0) {
            // Update existing review
            const existingReviewId = checkResult.rows[0].id;
            const updateQuery = `
                UPDATE reviews 
                SET rating = $1, review_text = $2, updated_at = NOW() 
                WHERE id = $3
                RETURNING *;
            `;
            result = await db.query(updateQuery, [rating, review, existingReviewId]);
            res.status(200).json({ message: 'Review updated successfully', review: result.rows[0] });
        } else {
            const insertQuery = `
                INSERT INTO reviews (course_id, user_id, rating, review_text, created_at, updated_at)
                VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *;
            `;
            result = await db.query(insertQuery, [courseId, userId, rating, review]);
            res.status(201).json({ message: 'Review submitted successfully', review: result.rows[0] });
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/course/:courseId/reviews', async (req, res) => {
    try {
        const { courseId } = req.params;
        const { userId } = req.query; 
        
        let query = `
            SELECT 
                r.id, r.rating, r.review_text, r.created_at, 
                COALESCE(r.updated_at, r.created_at) as updated_at,
                u.id AS user_id, u.name AS user_name, u.profile_image
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.course_id = $1
        `;
        
        const queryParams = [courseId];
        
        if (userId) {
            query += ` AND u.id = $2`;
            queryParams.push(userId);
        }
        
        query += ` ORDER BY r.created_at DESC`;
        
        const result = await db.query(query, queryParams);
        
        res.json({ reviews: result.rows });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Backend route handler for getting course author information 
router.get('/course-author/:courseId', async (req, res) => {
    try {
        const { courseId } = req.params;
        
        const query = 'SELECT author_id FROM all_courses WHERE id = $1';
        const result = await db.query(query, [courseId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        
        res.json({ author_id: result.rows[0].author_id });
    } catch (error) {
        console.error('Error fetching course author:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;