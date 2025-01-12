const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const sqlFilePath = path.join(__dirname, 'initdb.sql');
const sql = fs.readFileSync(sqlFilePath, 'utf8');

async function initdb() {
    try {
        await client.connect();
        console.log('Connected to the database');
        await client.query(sql);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await client.end();
        console.log('Database connection closed');
    }
}

initdb();