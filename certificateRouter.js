const express = require('express');
const router = express.Router();
const db = require('./db');

router.post('/certificate/issue', async (req, res) => {
    try {
        const { userId, courseId, issuedAt } = req.body;

        if (!userId || !courseId) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'User ID and Course ID are required'
            });
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

        const progressResult = await db.query(progressQuery, [courseId, userId]);
        
        if (progressResult.rows.length === 0) {
            return res.status(404).json({ error: 'Progress not found' });
        }

        const progress = progressResult.rows[0].progress_percentage;

        if (progress < 100) {
            return res.status(400).json({ 
                error: 'Course not completed',
                details: 'User must complete 100% of the course to receive a certificate'
            });
        }

        const existingCertQuery = `
            SELECT * FROM certificates 
            WHERE user_id = $1 AND course_id = $2
        `;
        
        const existingCertResult = await db.query(existingCertQuery, [userId, courseId]);
        
        if (existingCertResult.rows.length > 0) {
            const updateQuery = `
                UPDATE certificates 
                SET issued_at = $3, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $1 AND course_id = $2
                RETURNING *
            `;
            
            const updateResult = await db.query(updateQuery, [userId, courseId, issuedAt]);
            return res.json(updateResult.rows[0]);
        }
        
        const insertQuery = `
            INSERT INTO certificates (user_id, course_id, issued_at, created_at, updated_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *
        `;
        
        const result = await db.query(insertQuery, [userId, courseId, issuedAt]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error issuing certificate:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
});

router.get('/certificates/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const query = `
            SELECT 
                c.id as certificate_id,
                c.issued_at,
                crs.id as course_id,
                crs.name as course_name,
                crs.description as course_description,
                u.name as user_name
            FROM certificates c
            JOIN all_courses crs ON c.course_id = crs.id
            JOIN users u ON c.user_id = u.id
            WHERE c.user_id = $1
            ORDER BY c.issued_at DESC
        `;
        
        const result = await db.query(query, [userId]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching certificates:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
});

router.get('/certificate/check', async (req, res) => {
    try {
        const { userId, courseId } = req.query;
        
        if (!userId || !courseId) {
            return res.status(400).json({ 
                error: 'Missing required parameters',
                details: 'User ID and Course ID are required'
            });
        }
        
        const query = `
            SELECT * FROM certificates 
            WHERE user_id = $1 AND course_id = $2
        `;
        
        const result = await db.query(query, [userId, courseId]);
        
        res.json({ 
            hasCertificate: result.rows.length > 0,
            certificateData: result.rows[0] || null
        });
    } catch (error) {
        console.error('Error checking certificate:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const query = `
            SELECT name FROM users WHERE id = $1
        `;
        
        const result = await db.query(query, [userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
});

module.exports = router;