const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('./db.js'); 
const db = require('./db');
const router = express.Router();
const path = require("path");
const fs = require('fs'); 
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

// Middleware для аутентифікації
function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing' });
    }

    const token = authHeader.split(' ')[1]; // Очікуємо "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Token is missing' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        req.user = user; // Додаємо користувача до запиту
        next();
    });
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // ваша електронна пошта
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
            const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
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

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

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
        const resetLink = `http://localhost:8000/reset-password?token=${resetToken}`;

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

        // Використання транзакції для збереження даних
        await pool.query('BEGIN');
        // Створення користувача після успішної верифікації
        const result = await pool.query(
            `INSERT INTO users (name, email, user_password, phone_number, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, email, role, created_at`,
            [userData.name, email, passwordHash, userData.phone_number, userData.role]
        );
        const newUser = result.rows[0];
        // Якщо роль — студент, створити запис у таблиці `students`
        if (userData.role === 'student') {
            await pool.query(
                `INSERT INTO students (user_id, phone_number, additional_info)
                 VALUES ($1, $2, $3)`,
                [newUser.id, userData.phone_number, '']
            );
        }
         // Завершення транзакції
         await pool.query('COMMIT');
        // Видалення коду верифікації
        verificationCodes.delete(email);

        // Генерація токену
        const token = jwt.sign(
            { id: newUser.id, role: newUser.role, email: newUser.email }, 
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
        const existingUserResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
       /* if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "Email already exists" });
        }*/
            let userId;

            if (existingUserResult.rows.length > 0) {
                // Користувач існує - оновлюємо дані
                const existingUser = existingUserResult.rows[0];
    
                console.log("User exists, updating role and profile...");
                await pool.query(
                    `UPDATE users SET 
                        name = $1, 
                        phone_number = $2, 
                        role = 'teacher' 
                     WHERE email = $3`,
                    [name, phone_number, email]
                );
                userId = existingUser.id;
         // Хешуємо новий пароль, якщо його оновлюють
         if (password && password !== existingUser.user_password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query("UPDATE users SET user_password = $1 WHERE id = $2", [hashedPassword, userId]);
        }
    } else {
        // Користувача немає - створюємо нового
        console.log("Creating new teacher...");
        const hashedPassword = await bcrypt.hash(password, 10);
        const userResult = await pool.query(
            `INSERT INTO users (name, email, user_password, phone_number, role)
             VALUES ($1, $2, $3, $4, 'teacher')
             RETURNING id`,
            [name, email, hashedPassword, phone_number]
        );

        userId = userResult.rows[0].id;
    }

        // Зберігаємо сертифікати
        const certificates = req.files.map((file) => file.buffer);
       

        // Створюємо запис у таблиці `teachers` 
        await  pool.query(
            `INSERT INTO teachers (user_id, dob, gender, country, city, phone_number, zip_code, specialty, professional_experience, about, certificates)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 )`,
            [userId, dob, gender, country, city, phone_number, zip_code, specialty, professional_experience, about, certificates]
        );
        // Генеруємо посилання для підтвердження
        const confirmationLink = `http://localhost:8000/auth/confirm-teacher/${userId}`;

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

                To confirm this teacher, click the link below:
                ${confirmationLink}
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
router.post("/student-to-teacher", authenticate, upload.array("certificates"), async (req, res) => {
    const {email} = req.body;


    try {
        // Перевіряємо, чи користувач існує
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }

        const user = userResult.rows[0];

        // Перевіряємо, чи користувач уже є вчителем
        if (user.role === "teacher") {
            return res.status(400).json({ error: "User is already a teacher." });
        }

        // Оновлюємо роль користувача
        await pool.query("UPDATE users SET role = 'teacher' WHERE email = $1", [email]);
     

        res.status(200).json({ message: "User role updated to teacher successfully. Email sent to admin for confirmation." });
    } catch (error) {
        console.error("Error updating role to teacher:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Маршрут підтвердження даних адміністраторами
router.get("/confirm-teacher/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Перевіряємо, чи існує користувач із відповідним ID
        const userResult = await pool.query(
            "SELECT * FROM users WHERE id = $1 AND role = 'teacher'",
            [id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).send("Teacher not found or already confirmed.");
        }

        const user = userResult.rows[0];

        // Якщо користувач вже підтверджений
        if (user.is_verified) {
            return res.status(400).send("Teacher is already verified.");
        }

        // Оновлюємо статус верифікації
        await pool.query("UPDATE users SET is_verified = TRUE WHERE id = $1", [id]);

        // Текст повідомлення англійською та українською мовами
        const emailTextEN = `
            Dear ${user.name},

            Your application as a teacher on the StudyWith platform has been successfully verified by our administrator.
            You can now start working as a teacher on our platform.

            Best regards,
            The StudyWith Team
        `;

        const emailTextUA = `
            Шановний(-на) ${user.name}!

            Вашу заявку як викладача на платформі StudyWith було успішно перевірено нашим адміністратором.
            Тепер ви можете почати працювати вчителем на нашій платформі.

            З повагою,
            Команда StudyWith
        `;

        // Надсилаємо повідомлення користувачу
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email, // Отримуємо email користувача
            subject: "Your account has been verified! / Ваш обліковий запис підтверджено!",
            text: `${emailTextEN}\n\n${emailTextUA}`, // Об'єднані повідомлення на двох мовах
        };

        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${user.email}`);

        res.status(200).send("Teacher successfully confirmed, and email notification sent.");
    } catch (error) {
        console.error("Error confirming teacher:", error);
        res.status(500).send("Internal server error.");
    }
});
// Маршрут для надсилання запитань
router.post('/submit-question', authenticate, async (req, res) => {
    const { question } = req.body;
  
    if (!question || question.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Поле запитання не може бути порожнім.',
      });
    }
  
    try {
      // Надсилання листа через Nodemailer
      await transporter.sendMail({
        from: req.user.email,
        to: "studywith.connect@gmail.com",
        subject: 'New question from a user',
        text: `User: ${req.user.email || 'unknown'}\n\nQuestion:\n${question}`,
      });
  
      res.json({
        success: true,
        message: 'Your question was successfully sent!',
      });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({
        success: false,
        error: 'There was a problem sending your question. Please try again later.',
      });
    }
  });
  router.get('/auth-check', authenticate, (req, res) => {
    res.json({ authenticated: true });
  });

  router.put('/profile/:id', async (req, res) => {
    const userId = req.params.id;
    const { name, nickname, date_of_birth, phone_number, description } = req.body;

    try {
        // Використання транзакції для оновлення даних
        await pool.query('BEGIN');

        // Оновлення таблиці `users`
        await pool.query(
            `UPDATE users
             SET name = $1, phone_number = $2
             WHERE id = $3`,
            [name, phone_number, userId]
        );

        // Оновлення таблиці `students`
        const result = await pool.query(
            `UPDATE students
             SET additional_info = $1, date_of_birth = $2, phone_number = $3, nickname = $4
             WHERE user_id = $5
             RETURNING id`,
            [description, date_of_birth, phone_number, nickname, userId]
        );

        // Якщо запис у `students` не існує, створюємо його
        if (result.rowCount === 0) {
            await pool.query(
                `INSERT INTO students (user_id, phone_number, date_of_birth, additional_info, nickname)
                 VALUES ($1, $2, $3, $4, $5)`,
                [userId, phone_number, date_of_birth, description, nickname]
            );
        }

        await pool.query('COMMIT');
        res.status(200).json({ message: 'Profile updated successfully!' });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error(err.message);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
// Маршрут для оновлення пароля авторизованого користувача
router.put('/update-password', async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    // Перевірка обов’язкових полів
    if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Отримання даних користувача
        const userResult = await pool.query('SELECT user_password FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = userResult.rows[0];
        

        // Перевірка поточного пароля
        const isPasswordValid = await bcrypt.compare(currentPassword, user.user_password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Хешування нового пароля
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Оновлення пароля в базі даних
        await pool.query('UPDATE users SET user_password = $1 WHERE id = $2', [hashedPassword, userId]);

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//маршрут для закриття акаунта
router.put('/close-account', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // Оновлюємо стан профілю в базі
        await pool.query(
            `UPDATE users
             SET is_private = TRUE
             WHERE id = $1`,
            [userId]
        );

        res.status(200).json({ message: 'Account closed successfully. Your profile is now private.' });
    } catch (error) {
        console.error('Error closing account:', error.message);
        res.status(500).json({ error: 'Failed to close account' });
    }
});
router.put('/open-account', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // Оновлення стану профілю в базі
        await pool.query(
            `UPDATE users
             SET is_private = FALSE
             WHERE id = $1`,
            [userId]
        );

        res.status(200).json({ message: 'Account is now public. Your profile is visible to others.' });
    } catch (error) {
        console.error('Error opening account:', error.message);
        res.status(500).json({ error: 'Failed to open account' });
    }
});

// маршрут для перевірки приватності профілю
router.get('/auth/profile/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Отримуємо дані користувача
        const userResult = await pool.query(
            `SELECT name, email, phone_number, is_private
             FROM users
             WHERE id = $1`,
            [userId]
        );

        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Якщо профіль приватний, повертаємо відповідне повідомлення
        if (user.is_private) {
            return res.status(403).json({ error: 'This profile is private.' });
        }

        // Повертаємо дані профілю
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Маршрут для отримання даних профілю
router.get('/profile/teacher/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const profileResult = await pool.query(
            `SELECT
        u.name AS real_name,
        u.profile_image,
        u.phone_number,
        t.nickname,
        t.about,
        t.education,
        t.experience,
        t.hobbies,
        t.language,
        t.certificates,
        t.dob,
        t.country,
        t.city,
        t.zip_code,
        t.specialty,
        t.professional_experience,
        t.author_stripe_account,
        (
            SELECT json_agg(
                json_build_object(
                    'id', c.id,
                    'name', c.name,
                    'price', c.price,
                    'description', c.description,
                    'image_url', c.image_url,
                    'status', c.status,
                    'created_at', c.created_at
                )
            )
            FROM all_courses c
            WHERE c.author_id = u.id
        ) AS courses
    FROM users u
    LEFT JOIN teachers t ON u.id = t.user_id
    WHERE u.id = $1
    GROUP BY u.id, t.id, u.profile_image`,  
    [userId]
);

        const reviewsResult = await pool.query(
            `SELECT
                u.name AS student_name,
                tr.rating,
                tr.comment,
                tr.created_at
            FROM teacher_reviews tr
            JOIN users u ON tr.student_id = u.id
            JOIN teachers t ON tr.teacher_id = t.id
            WHERE t.user_id = $1
            ORDER BY tr.created_at DESC
            LIMIT 10`,
            [userId]
        );

        const profile = profileResult.rows[0];
        const reviews = reviewsResult.rows;

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        if (profile.certificates) {
            profile.certificates = Buffer.from(profile.certificates).toString('base64');
        }

        res.status(200).json({
            ...profile,
            reviews: reviews
        });
    } catch (error) {
        console.error('Error fetching teacher profile:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Новий маршрут для оновлення даних профілю
router.put('/profile/teacher/:id', async (req, res) => {
    const userId = req.params.id;
    const {
        name,
        phone_number,
        nickname,
        about,
        education,
        experience,
        hobbies,
        language,
        dob,
        country,
        city,
        zip_code,
        specialty,
        professional_experience,
        author_stripe_account
    } = req.body;

    try {
        await pool.query('BEGIN'); 

        const updateUserResult = await pool.query(
            `UPDATE users 
            SET name = $1, 
                phone_number = $2
            WHERE id = $3 
            RETURNING *`,
            [name, phone_number, userId]
        );

        if (updateUserResult.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ error: 'User not found' });
        }

                const updateTeacherResult = await pool.query(
            `UPDATE teachers 
            SET nickname = $1,
                about = $2,
                education = $3,
                experience = $4,
                hobbies = $5,
                language = $6,
                dob = $7,
                country = $8,
                city = $9,
                zip_code = $10,
                specialty = $11,
                professional_experience = $12,
                author_stripe_account = $13
            WHERE user_id = $14 
            RETURNING *`,
            [
                nickname,
                about,
                education,
                experience,
                hobbies,
                language,
                dob,
                country,
                city,
                zip_code,
                specialty,
                professional_experience,
                author_stripe_account,
                userId
            ]
        );

        if (updateTeacherResult.rows.length === 0) {
            // Якщо запис вчителя не існує, створюємо новий
            await pool.query(
                `INSERT INTO teachers (
                    user_id, nickname, about, education, experience, 
                    hobbies, language, dob, country, city, 
                    zip_code, specialty, professional_experience, author_stripe_account

                    
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                [
                    userId, nickname, about, education, experience,
                    hobbies, language, dob, country, city,
                    zip_code, specialty, professional_experience, author_stripe_account
                ]
            );
        }

     if (author_stripe_account) {
        await pool.query(
            `UPDATE all_courses 
            SET author_stripe_account = $1 
            WHERE author_id = $2`,
            [author_stripe_account, userId]
        );
        }

        await pool.query('COMMIT'); 

        res.status(200).json({
            message: 'Profile updated successfully',
            data: {
                ...updateUserResult.rows[0],
                ...updateTeacherResult.rows[0],
                author_stripe_account
            }
        });
        } catch (error) {
            await pool.query('ROLLBACK'); 
            console.error('Error updating teacher profile:', error.message);
            res.status(500).json({ 
                error: 'Failed to update profile',
                details: error.message 
            });
        }
});

// Налаштування multer для завантаження файлів
const uploadDir = path.join(__dirname, 'uploads/profile-images');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Унікальне ім'я файлу
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname); // отримуємо розширення
        cb(null, `profile-${uniqueSuffix}${ext}`);
    },
});

// Фільтр для обмеження типів файлів
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, and GIF formats are allowed!'), false);
    }
};

const uploads = multer({
    storage,
    limits: { fileSize: 1 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            cb(new Error('Only image files are allowed!'));
        } else {
            cb(null, true);
        }
    },
});

router.post('/upload-profile-image', uploads.single('profileImage'), async (req, res) => {
    try {
        const email = req.body.email;
        if (!email) {
            return res.status(400).json({ error: 'Email is required.' });
        }

        let filePath;
        if (req.file) {
            filePath = `/uploads/profile-images/${req.file.filename}`;
        } else {
            filePath = '/images/user-avatar.png';
        }

        const query = `UPDATE users SET profile_image = $1 WHERE email = $2`;
        const values = [filePath, email];

        const result = await db.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ 
            message: 'Profile image updated successfully!', 
            filePath 
        });
    } catch (error) {
        console.error('Error uploading profile image:', error);
        res.status(500).json({ error: 'Failed to upload profile image.' });
    }
});

router.get('/profile/student/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const query = `
            SELECT 
                u.id,
                u.name, 
                u.email,
                u.user_password, 
                s.profile_image,
                u.role,
                s.nickname,
                s.date_of_birth,
                s.phone_number,
                s.additional_info
            FROM users u
            LEFT JOIN students s ON u.id = s.user_id
            WHERE u.id = $1
        `;

        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const profile = result.rows[0];
        profile.profile_image = profile.profile_image || '/images/user-avatar.png';

        res.status(200).json(profile);
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/upload-student-profile-image', uploads.single('profileImage'), async (req, res) => {
    try {
        const userId = req.body.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required.' });
        }

        let filePath;
        if (req.file) {
            filePath = `/uploads/profile-images/${req.file.filename}`;
        } else {
            filePath = '/images/user-avatar.png';
        }

        await pool.query('BEGIN');

        try {
            const updateQuery = `
                UPDATE students 
                SET profile_image = $1 
                WHERE user_id = $2 
                RETURNING *
            `;
            const result = await pool.query(updateQuery, [filePath, userId]);

            if (result.rowCount === 0) {
                const insertQuery = `
                    INSERT INTO students (user_id, profile_image)
                    VALUES ($1, $2)
                `;
                await pool.query(insertQuery, [userId, filePath]);
            }

            await pool.query('COMMIT');
            res.status(200).json({ 
                message: 'Profile image updated successfully!', 
                filePath 
            });
        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error uploading profile image:', error);
        res.status(500).json({ error: 'Failed to upload profile image.' });
    }
});

router.post('/update-student-profile', async (req, res) => {
    try {
        const { 
            userId, 
            nickname, 
            name,
            dateOfBirth,         
            phoneNumber,         
            additionalInfo        
        } = req.body;
        
        // Починаємо транзакцію
        await pool.query('BEGIN');

        try {
            await pool.query(
                'UPDATE users SET name = $1 WHERE id = $2',
                [name, userId]
            );

            const studentCheck = await pool.query(
                'SELECT id FROM students WHERE user_id = $1',
                [userId]
            );

            if (studentCheck.rows.length > 0) {
                await pool.query(
                    `UPDATE students 
                     SET nickname = $1,
                         date_of_birth = $2,
                         phone_number = $3,
                         additional_info = $4
                     WHERE user_id = $5`,
                    [nickname, dateOfBirth, phoneNumber, additionalInfo, userId]
                );
            } else {
                await pool.query(
                    `INSERT INTO students 
                     (user_id, nickname, date_of_birth, phone_number, additional_info)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [userId, nickname, dateOfBirth, phoneNumber, additionalInfo]
                );
            }

            await pool.query('COMMIT');
            
            res.json({ 
                success: true,
                message: 'Student profile updated successfully',
                data: {
                    name,
                    nickname,
                    dateOfBirth,
                    phoneNumber,
                    additionalInfo
                }
            });
        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error updating student profile:', error);
        res.status(500).json({ 
            error: 'Failed to update student profile',
            details: error.message 
        });
    }
});

router.post('/reset-profile-image', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required.' });
        }

        const defaultImage = '/images/user-avatar.png';
        
        const query = `
            UPDATE students 
            SET profile_image = $1 
            WHERE user_id = $2 
            RETURNING *
        `;
        
        const result = await pool.query(query, [defaultImage, userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Student profile not found.' });
        }

        res.status(200).json({ 
            message: 'Profile image reset successfully!',
            profileImage: defaultImage
        });
    } catch (error) {
        console.error('Error resetting profile image:', error);
        res.status(500).json({ error: 'Failed to reset profile image.' });
    }
});


router.get('/profile-image/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const query = `
            SELECT profile_image 
            FROM students 
            WHERE user_id = $1
        `;
        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return res.json({ profileImage: '/images/user-avatar.png' });
        }

        const profileImage = result.rows[0].profile_image || '/images/user-avatar.png';
        res.json({ profileImage });
    } catch (error) {
        console.error('Error fetching profile image:', error);
        res.status(500).json({ error: 'Failed to fetch profile image.' });
    }
});


router.get('/api/public-profile/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        console.log(`Request received for profile ID: ${req.params.id}`);

        // Використовуємо існуючий маршрут для отримання даних профілю
        const profileResult = await pool.query(
            `SELECT 
                u.name AS real_name,
                u.profile_image,
                u.phone_number,
                t.nickname,
                t.about,
                t.education,
                t.experience,
                t.hobbies,
                t.language,
                t.certificates,
                t.dob,
                t.country,
                t.city,
                t.zip_code,
                t.specialty,
                t.professional_experience,
                t.author_stripe_account,
                (
                    SELECT json_agg(
                        json_build_object(
                            'id', c.id,
                            'name', c.name,
                            'price', c.price,
                            'description', c.description,
                            'image_url', c.image_url,
                            'status', c.status,
                            'created_at', c.created_at
                        )
                    )
                    FROM all_courses c
                    WHERE c.author_id = u.id
                ) AS courses
            FROM users u
            LEFT JOIN teachers t ON u.id = t.user_id
            WHERE u.id = $1
            GROUP BY u.id, t.id, u.profile_image`,
            [userId]
        );
        
        const reviewsResult = await pool.query(
            `SELECT 
                u.name AS student_name,
                r.rating,
                r.review_text AS comment,
                r.created_at
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN all_courses c ON r.course_id = c.id
            WHERE c.author_id = $1
            ORDER BY r.created_at DESC
            LIMIT 10`,
            [userId]
        );
        
        const profile = profileResult.rows[0];
        const reviews = reviewsResult.rows;
        
        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        
        if (profile.certificates) {
            profile.certificates = Buffer.from(profile.certificates).toString('base64');
        }
        
        res.status(200).json({
            ...profile,
            reviews: reviews
        });
    } catch (error) {
        console.error('Error fetching teacher profile:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});
module.exports = router;