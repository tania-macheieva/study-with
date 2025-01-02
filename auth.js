const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('./db.js'); 
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();
const passport = require('passport');
const multer = require("multer");
const GoogleStrategy = require('passport-google-oauth20').Strategy;


// Налаштування Multer для обробки файлів
const upload = multer({ storage: multer.memoryStorage() });

const SECRET_KEY = process.env.JWT_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8000';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,         // ваша електронна пошта
        pass: process.env.EMAIL_PASSWORD,
    },
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:8000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const { email, name } = profile._json; // Використовуємо дані з профілю Google

        // Перевірка, чи користувач існує в базі даних
        const result = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );

        let user;
        if (result.rows.length > 0) {
            user = result.rows[0]; // Якщо користувач є, використовуємо його
        } else {
            // Якщо користувач не знайдений, створюємо нового
            const passwordHash = 'google-authenticated'; // Використовуємо тимчасовий пароль
            const insertResult = await pool.query(
                `INSERT INTO users (name, email, user_password, role)
                VALUES ($1, $2, $3, $4)
                RETURNING id, name, email, role, created_at`,
                [name, email, passwordHash, 'student'] // 'student' роль за замовчуванням
            );
            user = insertResult.rows[0];
        }

        // Перевірка, чи є user перед створенням токену
        if (user && user.id) {
            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return done(null, { user, token });
        } else {
            return done(new Error('User not found or created'));
        }
    } catch (error) {
        console.error(error);
        return done(error, false);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Маршрут для початку авторизації через Google
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

// Маршрут для обробки callback після авторизації через Google
router.get('/google/callback',
    passport.authenticate('google', { 
        session: false, 
        failureRedirect: `${FRONTEND_URL}/login` // Додано обробку помилок
    }),
    (req, res) => {
        const { user, token } = req.user;
        
        // Замість JSON відповіді тепер редирект
        res.redirect(
            `${FRONTEND_URL}?token=${token}&userId=${user.id}&role=${user.role}&name=${encodeURIComponent(user.name)}`
        );
    }
);


router.post('/send-email', async (req, res) => {
       const { email, phone } = req.body;
    
      // Перевірка валідності даних
     if (!email || !phone) {
     return res.status(400).json({ error: 'Email and phone are required' });
     }
    
     // Формування повідомлення
     const mailOptions = {
     from: email, // Пошта відправника (взята з форми)
     to: 'studywith.connect@gmail.com', // Пошта, куди надсилати повідомлення
     subject: 'New Contact Submission',
    text: `User email: ${email}\nUser phone: ${phone}`,
    };
    
    try {
    // Надсилання email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
       }
     });



// // Маршрут для реєстрації
// router.post('/register', async (req, res) => {
//     const { name, email, password, phone_number, role } = req.body;

//     if (!name || !email || !password || !['student', 'teacher'].includes(role)) {
//         return res.status(400).json({ error: 'Invalid input' });
//     }

//     try {
//         const passwordHash = await bcrypt.hash(password, 10);
//         const result = await pool.query(
//             `INSERT INTO users (name, email, user_password, phone_number, role)
//              VALUES ($1, $2, $3, $4, $5)
//              RETURNING id, name, email, role, created_at`,
//             [name, email, passwordHash, phone_number, role]
//         );

//         const newUser = result.rows[0];

//         // Генерація токену
//         const token = jwt.sign({ id: newUser.id, role: newUser.role }, SECRET_KEY, { expiresIn: '1h' });
//         res.status(201).json({
//             message: 'User registered successfully!',
//             user: {
//                 id: newUser.id,
//                 name: newUser.name,
//                 email: newUser.email,
//                 role: newUser.role,
//                 created_at: newUser.created_at,
//             },
//             token: token,
//         });
//     } catch (err) {
//         console.error(err.message);

//         if (err.code === '23505') { 
//             res.status(400).json({ error: 'Email already exists' });
//         } else {
//             res.status(500).json({ error: 'Internal server error' });
//         }
//     }
// });
// Маршрут для авторизації
router.post('/login', async (req, res) => {
    console.log('Отримані дані:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email та пароль обов\'язкові' });
    }

    try {
        const result = await pool.query(
            `SELECT id, name, email, user_password, role FROM users WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Неправильний email або пароль' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.user_password);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Неправильний email або пароль' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

        // Повертаємо дані користувача та токен
        res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token: token
        });
        
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Внутрішня помилка сервера' });
    }
});

// Маршрут для скидання пароля
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) return res.status(404).json({ error: 'User not found' });

        const resetToken = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '15m' });
        const resetLink = `http://localhost:8000/reset-password.html?token=${resetToken}`;

        transporter.sendMail({
            from: EMAIL_USER,
            to: email,
            subject: 'Reset password',
            text: `Please click on the link to reset your password: ${resetLink}`
        }, (err, info) => {
            if (err) {
                console.error('Email send failed:', err);
                return res.status(500).json({ error: 'Failed to send email' });
            }
            console.log('Email sent:', info.response);
            
            res.json({ message: 'Password reset link sent to your email.' });
        });

    } catch (error) {
        console.error(error.message);
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
});



// Маршрут для скидання пароля
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const userId = decoded.id;
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query('UPDATE users SET user_password = $1 WHERE id = $2', [hashedPassword, userId]);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error.message);
        if (error.name === 'TokenExpiredError') {
            res.status(400).json({ error: 'Token expired' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// Зберігання кодів верифікації в пам'яті
const verificationCodes = new Map(); // email -> { code, expires, userData }

// Генерація 6-значного коду
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Оновлений маршрут реєстрації з верифікацією email
router.post('/register', async (req, res) => {
    const { name, email, password, phone_number, role } = req.body;

    if (!name || !email || !password || !['student', 'teacher'].includes(role)) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    try {
        // Перевірка чи email вже існує
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Генерація коду верифікації
        const verificationCode = generateVerificationCode();
        
        // Зберігання даних для верифікації
        verificationCodes.set(email, {
            code: verificationCode,
            expires: Date.now() + 60 * 60 * 1000, // 1 година
            userData: { name, password, phone_number, role }
        });

        // Відправка коду на email
        await transporter.sendMail({
            from: EMAIL_USER,
            to: email,
            subject: 'Підтвердження email',
            text: `Ваш код підтвердження: ${verificationCode}`
        });

        res.status(201).json({ 
            message: 'Verification code sent to your email',
            redirectUrl: '/confirm-email'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Новий маршрут для верифікації email
router.post('/verify-email', async (req, res) => {
    const { email, code } = req.body;

    try {
        const verification = verificationCodes.get(email);
        
        if (!verification || 
            verification.code !== code || 
            verification.expires < Date.now()) {
            return res.status(400).json({ 
                error: 'Invalid or expired verification code' 
            });
        }

        const { userData } = verification;
        const passwordHash = await bcrypt.hash(userData.password, 10);

        // Створення користувача після успішної верифікації
        const result = await pool.query(
            `INSERT INTO users (name, email, user_password, phone_number, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, email, role, created_at`,
            [userData.name, email, passwordHash, userData.phone_number, userData.role]
        );

        const newUser = result.rows[0];
        
        // Видалення коду верифікації
        verificationCodes.delete(email);

        // Генерація токену
        const token = jwt.sign(
            { id: newUser.id, role: newUser.role }, 
            SECRET_KEY, 
            { expiresIn: '1h' }
        );

        res.status(201).json({
            message: 'User registered successfully!',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                created_at: newUser.created_at,
            },
            token: token,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Новий маршрут для повторної відправки коду
router.post('/resend-code', async (req, res) => {
    const { email } = req.body;

    try {
        const verification = verificationCodes.get(email);
        if (!verification) {
            return res.status(404).json({ error: 'Registration not found' });
        }

        const newCode = generateVerificationCode();
        
        // Оновлення коду верифікації
        verificationCodes.set(email, {
            ...verification,
            code: newCode,
            expires: Date.now() + 60 * 60 * 1000
        });

        // Відправка нового коду
        await transporter.sendMail({
            from: EMAIL_USER,
            to: email,
            subject: 'Новий код підтвердження',
            text: `Ваш новий код підтвердження: ${newCode}`
        });

        res.json({ message: 'New verification code sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/register/teacher/full-registration", upload.array("certificates"), async (req, res) => {
    const {
        name,
        email,
        password,
        phone_number,
        dob,
        gender,
        country,
        city,
        zip_code,
        specialty,
        professional_experience,
        about,
    } = req.body;

    if (!name || !email || !password || !phone_number || !dob || !gender || !country || !city || !specialty) {
        return res.status(400).json({ error: "All required fields must be provided" });
    }
    try {
     
        // Логування отриманих даних
        console.log("Received body:", req.body);
        console.log("Received files:", req.files);
      
        // Перевіряємо, чи користувач вже існує
        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Хешуємо пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Створюємо запис у таблиці `users`
        const userResult = await  pool.query(
            `INSERT INTO users (name, email, user_password, phone_number, role)
             VALUES ($1, $2, $3, $4, 'teacher')
             RETURNING id`,
            [name, email, hashedPassword, phone_number]
        );

        const userId = userResult.rows[0].id;

        // Зберігаємо сертифікати
        const certificates = req.files.map((file) => file.buffer);
       

        // Створюємо запис у таблиці `teachers` 
        await  pool.query(
            `INSERT INTO teachers (user_id, dob, gender, country, city, phone_number, zip_code, specialty, professional_experience, about, certificates)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 )`,
            [userId, dob, gender, country, city, phone_number, zip_code, specialty, professional_experience, about, certificates]
        );

        // Відправляємо email адміністратору
        const mailOptions2 = {
            from: email,
            to: "studywith.connect@gmail.com",
            subject: "New Teacher Registration",
            text: `
                A new teacher registration request has been received:
               Name: ${name}
                Email: ${email}
                Date of Birth: ${dob}
                Gender: ${gender || "Not specified"}
                Country: ${country}
                Phone: ${phone_number}
                City: ${city}
                Zip Code: ${zip_code || "Not provided"}
                Specialty: ${specialty}
                Experience Start Date: ${ professional_experience}
                About: ${about || "No additional information provided"}
            `,
            attachments: req.files.map((file) => ({
                filename: file.originalname,
                content: file.buffer,
            })),
        };

        await transporter.sendMail(mailOptions2);
      

        res.status(200).json({ message: "Teacher registration completed successfully!" });
    } catch (error) {
        console.error("Error during full teacher registration:", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    } 
});


// 3. Підтвердження даних адміністраторами
router.post("/confirm-teacher/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const user = await pool.query("SELECT * FROM users WHERE id = $1 AND role = 'teacher'", [id]);
        if (user.rows.length === 0) {
            return res.status(404).json({ error: "Teacher not found" });
        }

        await pool.query("UPDATE users SET is_verified = TRUE WHERE id = $1", [id]);
        res.status(200).json({ message: "Teacher registration confirmed successfully" });
    } catch (error) {
        console.error("Error confirming teacher:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;