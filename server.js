// Налаштування сесії та Passport 
const express = require ("express");
const app = express ();
const path = require("path");
const fs = require('fs'); 
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth'); 
require('dotenv').config({ path: './secret.env' });
const passport = require('passport');
const session = require('express-session');

app.get("/", (req, res) => { 
    res.send ("Server runing");
})

// Додаю статичні файли
app.use(express.static(path.join(__dirname, 'registration_pages')));

app.get("/main", (req, res) => { 
    res.sendFile(path.join(__dirname, 'registration_pages/main_page.html')); 
});
// Маршрут для реєстрації студента
app.get('/main/register/student', (req, res) => {
    res.sendFile(path.join(__dirname, 'registration_pages/reg_student.html'));
});

// Маршрут для реєстрації викладача
app.get('/main/register/teacher', (req, res) => {
    res.sendFile(path.join(__dirname, 'registration_pages/reg_teacher.html'));
});
app.use(express.static(path.join(__dirname, 'log-in-page')));

app.get('/log-in/', (req, res) => {
    res.sendFile(path.join(__dirname, 'log-in-page'));
});
app.get('/log-in/fogot-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'log-in-page/forgot-password.html'));
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ініціалізація сесії та Passport 
app.use(session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

// Маршрути
app.use("/auth", authRoutes);

app.get("/", (req, res) => { 
    res.send("Server is running");
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 8000;

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
