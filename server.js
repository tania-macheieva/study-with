const express = require ("express");
const app = express ();
const path = require("path");
const fs = require('fs'); 
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./auth'); 
require('dotenv').config({ path: './secret.env' });
const passport = require('passport');
const session = require('express-session');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Ініціалізація сесії та Passport 
app.use(session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

//Статичні файли
app.use(express.static(path.join(__dirname, 'privatpolicy')));
app.use(express.static(path.join(__dirname, 'registration_pages')));
app.use(express.static(path.join(__dirname, 'home'), {
    cacheControl: false,
    etag: false,
    maxAge: 0,
  }));
app.use(express.static(path.join(__dirname, 'log-in-page')));
app.use(express.static(path.join(__dirname, 'confirm_email_pages')));

app.use("/auth", authRoutes);

app.get("/", (req, res) => { 
    res.sendFile(path.join(__dirname, 'home/home.html')); 
});

app.get("/privatpolicy", (req, res) => { 
    res.sendFile(path.join(__dirname, 'privatpolicy/PrivatePolicy.html')); 
});
app.get("/courses", (req, res) => { 
    res.send ("Сторінка в розробці"); 
});
app.get("/about", (req, res) => { 
    res.send ("Сторінка в розробці"); 
});
app.get("/contact", (req, res) => { 
    res.send ("Сторінка в розробці");  
});
app.get("/faq", (req, res) => { 
    res.send ("Сторінка в розробці"); 
});
app.get("/terms-conditions", (req, res) => { 
    res.send ("Сторінка в розробці"); 
});

app.get("/register", (req, res) => { 
    res.sendFile(path.join(__dirname, 'registration_pages/main_page.html')); 
});
app.get('/reg-student', (req, res) => {
    res.sendFile(path.join(__dirname, 'registration_pages/reg_student.html'));
});
app.get('/reg-teacher', (req, res) => {
    res.sendFile(path.join(__dirname, 'registration_pages/reg_teacher.html'));
});

app.get("/confirm-email", (req, res) => { 
    res.sendFile(path.join(__dirname, 'confirm_email_pages/confirm_email.html'));
});
app.get('/fail-confirm-email', (req, res) => {
    res.sendFile(path.join(__dirname, 'confirm_email_pages/fail-confirm-email.html'));
});
app.get('/succes-confirm-email', (req, res) => {
    res.sendFile(path.join(__dirname, 'confirm_email_pages/succes_confsrm_email.html'));
});

app.get('/log-in/', (req, res) => {
    res.sendFile(path.join(__dirname, 'log-in-page'));
});
app.get('/log-in/fogot-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'log-in-page/forgot-password.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 8100;

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
