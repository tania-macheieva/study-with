const express = require('express');
const router = express.Router();
const db = require('./db');
const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');

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

const FONTS_PATH = path.join(__dirname, 'fonts');

router.post('/certificate/generate', async (req, res) => {
    try {
        console.log('Starting certificate generation process with PDFKit');
        const { userId, courseId } = req.body;
        
        if (!userId || !courseId) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                details: 'User ID and Course ID are required'
            });
        }
        
        const userQuery = `SELECT name FROM users WHERE id = $1`;
        const userResult = await db.query(userQuery, [userId]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const userName = userResult.rows[0].name;
        
        const courseQuery = `SELECT name FROM all_courses WHERE id = $1`;
        const courseResult = await db.query(courseQuery, [courseId]);
        
        if (courseResult.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        
        const courseName = courseResult.rows[0].name;
        console.log('Course name:', courseName);
        
        // Очищення назви курсу від спеціальних символів для формування імені файлу
        const sanitizedCourseName = courseName
            .replace(/[^\w\sа-яА-ЯіІїЇєЄ\-\.]/g, '') // видаляємо всі символи крім букв, цифр, пробілів, дефісів і крапок
            .replace(/\s+/g, '_') // замінюємо пробіли на підкреслення
            .substring(0, 50); // обмежуємо довжину
        
        console.log('Sanitized course name:', sanitizedCourseName);
        
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}.${(currentDate.getMonth() + 1).toString().padStart(2, '0')}.${currentDate.getFullYear()}`;
        const certNumber = `CERT-${currentDate.getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
        
        const certificateImagePath = path.join(__dirname, 'images', 'certificate1.png');
        const logoPath = path.join(__dirname, 'images', 'menu-logo.png');
        const signaturePath = path.join(__dirname, 'images', 'signature1.png');
        
        const regularFontPath = path.join(FONTS_PATH, 'Inter-Regular.ttf');
        const boldFontPath = path.join(FONTS_PATH, 'Inter-Bold.ttf');
        
        console.log('Image paths:', {
            certificateImagePath,
            logoPath,
            signaturePath,
            regularFontPath,
            boldFontPath
        });
        
        const certificateImageExists = await fs.pathExists(certificateImagePath);
        const logoExists = await fs.pathExists(logoPath);
        const signatureExists = await fs.pathExists(signaturePath);
        const regularFontExists = await fs.pathExists(regularFontPath);
        const boldFontExists = await fs.pathExists(boldFontPath);
        
        console.log('Files exist check:', {
            certificateImageExists,
            logoExists,
            signatureExists,
            regularFontExists,
            boldFontExists
        });
        
        // Створюємо безпечну назву файлу і правильно кодуємо її для HTTP-заголовка
        const safeCertificateFileName = `Certificate_${sanitizedCourseName}.pdf`;
        const encodedFileName = encodeURIComponent(safeCertificateFileName);
        
        console.log('Using filename:', safeCertificateFileName);
        console.log('Encoded filename:', encodedFileName);
        
        // Правильно встановлюємо заголовки
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFileName}`);
        
        // Створюємо PDF
        const doc = new PDFDocument({
            layout: 'landscape',
            size: 'A4',
            margin: 0,
            info: {
                Title: `${courseName} - Certificate`,
                Author: 'StudyWith',
                Subject: 'Course Completion Certificate'
            }
        });
        
        doc.pipe(res);
        
        if (regularFontExists) {
            doc.registerFont('InterRegular', regularFontPath);
        } else {
            console.warn('Regular font file not found, falling back to default');
        }
        
        if (boldFontExists) {
            doc.registerFont('InterBold', boldFontPath);
        } else {
            console.warn('Bold font file not found, falling back to default');
        }
        
        if (certificateImageExists) {
            doc.image(certificateImagePath, 0, 0, {
                width: doc.page.width,
                height: doc.page.height
            });
            console.log('Added certificate background image');
        } else {
            doc.rect(0, 0, doc.page.width, doc.page.height).fill('#FFFFFF');
            doc.rect(0, doc.page.height - 230, doc.page.width, 230).fill('#E6EEFF');
            console.log('Created default background');
        }
        
        if (logoExists) {
            doc.image(logoPath, 40, 40, { width: 40 });
            console.log('Added logo');
        }
        
        const titleFont = boldFontExists ? 'InterBold' : 'Helvetica-Bold';
        const regularFont = regularFontExists ? 'InterRegular' : 'Helvetica';
        
        doc.font(titleFont)
           .fontSize(28)
           .fillColor('#333')
           .text('StudyWith', 90, 45);
        
        doc.font(titleFont)
           .fontSize(64)
           .fillColor('#333')  
           .text('CERTIFICATE', 40, 100);
        
        doc.font(regularFont)
           .fontSize(20)
           .fillColor('#333')  
           .text('This certifies that', 40, 180);
        
        doc.font(titleFont)
           .fontSize(36)
           .fillColor('#333')  
           .text(userName.toUpperCase(), 40, 210);
        
        doc.font(regularFont)
           .fontSize(20)
           .fillColor('#333')  
           .text('Has successfully completed the course', 40, 270);
        
        doc.font(titleFont)
           .fontSize(30)
           .fillColor('#333')  
           .text(courseName, 40, 300, { width: 500 });
        
        doc.font(regularFont)
           .fontSize(20)
           .fillColor('#333')  
           .text('Date of issue', 40, 360);
        
        doc.font(titleFont)
           .fontSize(24)
           .fillColor('#333') 
           .text(formattedDate, 40, 390);
        
        doc.font(regularFont)
           .fontSize(16)
           .fillColor('#333')  
           .text(certNumber, 40, 500);
        
        if (signatureExists) {
            doc.image(signaturePath, 40, 430, { width: 150 });
            console.log('Added signature');
        }
        
        const existingCertQuery = `
            SELECT * FROM certificates 
            WHERE user_id = $1 AND course_id = $2
        `;
        
        const existingCertResult = await db.query(existingCertQuery, [userId, courseId]);
        
        if (existingCertResult.rows.length > 0) {
            await db.query(`
                UPDATE certificates 
                SET issued_at = $3, updated_at = CURRENT_TIMESTAMP, certificate_number = $4
                WHERE user_id = $1 AND course_id = $2
            `, [userId, courseId, currentDate, certNumber]);
            console.log('Updated existing certificate record in DB');
        } else {
            await db.query(`
                INSERT INTO certificates (user_id, course_id, issued_at, created_at, updated_at, certificate_number)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $4)
            `, [userId, courseId, currentDate, certNumber]);
            console.log('Inserted new certificate record in DB');
        }
        
        doc.end();
        console.log('Certificate generation process completed successfully');
        
    } catch (error) {
        console.error('Error generating certificate with PDFKit:', error);
        
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Internal server error',
                details: error.message
            });
        } else {
            res.end();
        }
    }
});

router.get('/certificate/verify/:certificateNumber', async (req, res) => {
    try {
        const { certificateNumber } = req.params;
        
        if (!certificateNumber) {
            return res.status(400).json({ 
                error: 'Номер сертифікату не вказано',
                details: 'Необхідно вказати номер сертифікату'
            });
        }
        
        const query = `
            SELECT 
                c.id as certificate_id,
                c.certificate_number,
                c.issued_at,
                crs.id as course_id,
                crs.name as course_name,
                u.id as user_id,
                u.name as user_name
            FROM certificates c
            JOIN all_courses crs ON c.course_id = crs.id
            JOIN users u ON c.user_id = u.id
            WHERE c.certificate_number = $1
        `;
        
        const result = await db.query(query, [certificateNumber]);
        
        if (result.rows.length === 0) {
            return res.json({ 
                isValid: false,
                message: 'Сертифікат не знайдено'
            });
        }
        
        const certificate = result.rows[0];
        
        res.json({ 
            isValid: true,
            certificate: {
                id: certificate.certificate_id,
                number: certificate.certificate_number,
                issuedAt: certificate.issued_at,
                courseId: certificate.course_id,
                courseName: certificate.course_name,
                userId: certificate.user_id,
                userName: certificate.user_name
            }
        });
    } catch (error) {
        console.error('Помилка перевірки сертифікату:', error);
        res.status(500).json({ 
            error: 'Внутрішня помилка сервера',
            details: error.message
        });
    }
});
module.exports = router;