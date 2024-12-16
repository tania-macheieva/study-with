// const express = require('express');
// const bcrypt = require('bcrypt');
// const pool = require('../db.js'); 
// const router = express.Router();
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');
// require('dotenv').config({ path: './secret.env' });
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;


// const SECRET_KEY = process.env.JWT_SECRET;
// const EMAIL_USER = process.env.EMAIL_USER;
// const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;


// // Маршрут для обробки форми

// router.post('/send-email', async (req, res) => {
//     const { email, phone } = req.body;

//     // Перевірка валідності даних
//     if (!email || !phone) {
//         return res.status(400).json({ error: 'Email and phone are required' });
//     }

//     // Формування повідомлення
//     const mailOptions = {
//         from: email, // Пошта відправника (взята з форми)
//         to: 'studywith.connect@gmail.com', // Пошта, куди надсилати повідомлення
//         subject: 'New Contact Submission',
//         text: `User email: ${email}\nUser phone: ${phone}`,
//     };

//     try {
//         // Надсилання email
//         await transporter.sendMail(mailOptions);
//         console.log('Email sent successfully');
//         res.status(200).json({ message: 'Email sent successfully' });
//     } catch (error) {
//         console.error('Error sending email:', error);
//         res.status(500).json({ error: 'Failed to send email' });
//     }
// });


// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,         // ваша електронна пошта
//         pass: process.env.EMAIL_PASSWORD,
//     },
// });

// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: 'http://localhost:8000/auth/google/callback'
// }, async (accessToken, refreshToken, profile, done) => {
//     try {
//         const { email, name } = profile._json; // Використовуємо дані з профілю Google

//         // Перевірка, чи користувач існує в базі даних
//         const result = await pool.query(
//             `SELECT * FROM users WHERE email = $1`,
//             [email]
//         );

//         let user;
//         if (result.rows.length > 0) {
//             user = result.rows[0]; // Якщо користувач є, використовуємо його
//         } else {
//             // Якщо користувач не знайдений, створюємо нового
//             const passwordHash = 'google-authenticated'; // Використовуємо тимчасовий пароль
//             const insertResult = await pool.query(
//                 `INSERT INTO users (name, email, user_password, role)
//                 VALUES ($1, $2, $3, $4)
//                 RETURNING id, name, email, role, created_at`,
//                 [name, email, passwordHash, 'student'] // 'student' роль за замовчуванням
//             );
//             user = insertResult.rows[0];
//         }

//         // Перевірка, чи є user перед створенням токену
//         if (user && user.id) {
//             const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
//             return done(null, { user, token });
//         } else {
//             return done(new Error('User not found or created'));
//         }
//     } catch (error) {
//         console.error(error);
//         return done(error, false);
//     }
// }));

// passport.serializeUser((user, done) => {
//     done(null, user);
// });

// passport.deserializeUser((user, done) => {
//     done(null, user);
// });

// // Маршрут для початку авторизації через Google
// router.get('/google',
//     passport.authenticate('google', {
//         scope: ['profile', 'email'],
//     })
// );

// // Маршрут для обробки callback після авторизації через Google
// router.get('/google/callback',
//     passport.authenticate('google', { session: false }),
//     (req, res) => {
//         // Після успішної авторизації, видаємо JWT
//         const { user, token } = req.user;
//         res.json({
//             message: 'Google authorization successful',
//             user: {
//                 id: user.id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//             },
//             token: token,
//         });
//     }
// );



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
// // Маршрут для авторизації
// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({ error: 'Email та пароль обов\'язкові' });
//     }

//     try {
//         // Перевірка, чи користувач існує в базі даних
//         const result = await pool.query(
//             `SELECT id, name, email, user_password, role FROM users WHERE email = $1`,
//             [email]
//         );

//         if (result.rows.length === 0) {
//             return res.status(401).json({ error: 'Неправильний email або пароль' });
//         }

//         const user = result.rows[0];

//         // Перевірка пароля
//         const isMatch = await bcrypt.compare(password, user.user_password);
//         if (!isMatch) {
//             return res.status(401).json({ error: 'Неправильний email або пароль' });
//         }

//         // Генерація JWT-токену
//         const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

//         res.status(200).json({
//             message: 'Авторизація пройшла успішно!',
//             user: {
//                 id: user.id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//             },
//             token: token,
//         });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json({ error: 'Внутрішня помилка сервера' });
//     }
// });

// // Маршрут для скидання пароля
// router.post('/forgot-password', async (req, res) => {
//     const { email } = req.body;
//     if (!email) return res.status(400).json({ error: 'Email is required' });
    
//     try {
//         const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
//         const user = userResult.rows[0];

//         if (!user) return res.status(404).json({ error: 'User not found' });

//         const resetToken = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '15m' });
//         const resetLink = `http://localhost:8000/reset-password.html?token=${resetToken}`;

//         transporter.sendMail({
//             from: EMAIL_USER,
//             to: email,
//             subject: 'Reset password',
//             text: `Please click on the link to reset your password: ${resetLink}`
//         }, (err, info) => {
//             if (err) {
//                 console.error('Email send failed:', err);
//                 return res.status(500).json({ error: 'Failed to send email' });
//             }
//             console.log('Email sent:', info.response);
            
//             res.json({ message: 'Password reset link sent to your email.' });
//         });

//     } catch (error) {
//         console.error(error.message);
//         if (!res.headersSent) {
//             return res.status(500).json({ error: 'Internal server error' });
//         }
//     }
// });



// // Маршрут для скидання пароля
// router.post('/reset-password', async (req, res) => {
//     const { token, password } = req.body;

//     try {
//         const decoded = jwt.verify(token, SECRET_KEY);
//         const userId = decoded.id;
//         const hashedPassword = await bcrypt.hash(password, 10);

//         await pool.query('UPDATE users SET user_password = $1 WHERE id = $2', [hashedPassword, userId]);

//         res.json({ message: 'Password changed successfully' });
//     } catch (error) {
//         console.error(error.message);
//         if (error.name === 'TokenExpiredError') {
//             res.status(400).json({ error: 'Token expired' });
//         } else {
//             res.status(500).json({ error: 'Internal server error' });
//         }
//     }
// });

// module.exports = router;