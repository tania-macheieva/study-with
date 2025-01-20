const express = require('express');
const Fuse = require('fuse.js');
const coursesData = require('./coursesData');
const pool = require('./db');
const router = express.Router();

const fuseOptions = {
    keys: ['name', 'description', 'themes'],
    threshold: 0.3,
    distance: 100
};

// Функція для пошуку в базі даних
async function searchDatabase(query) {
    try {
        const searchQuery = `
            SELECT 
                c.*,
                u.name as author_name,
                cat.name as category_name,
                el.name as education_level
            FROM all_courses c
            LEFT JOIN users u ON c.author_id = u.id
            LEFT JOIN categories cat ON c.category_id = cat.id
            LEFT JOIN education_levels el ON c.education_level_id = el.id
            WHERE 
                c.status = 'published' AND
                (c.name ILIKE $1 OR c.description ILIKE $1)
        `;
        const result = await pool.query(searchQuery, [`%${query}%`]);
        
        return result.rows.map(course => ({
            name: course.name,
            description: course.description,
            price: parseFloat(course.price),
            themes: [course.category_name],
            level: course.education_level.toLowerCase().replace(' level', ''),
            author: course.author_name
        }));
    } catch (error) {
        console.error('Database search error:', error);
        return null;
    }
}

// Основний маршрут пошуку
router.get('/search', async (req, res) => {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
        // Повертаємо всі курси
        try {
            const result = await pool.query(`
                SELECT 
                    c.*,
                    u.name as author_name,
                    cat.name as category_name,
                    el.name as education_level
                FROM all_courses c
                LEFT JOIN users u ON c.author_id = u.id
                LEFT JOIN categories cat ON c.category_id = cat.id
                LEFT JOIN education_levels el ON c.education_level_id = el.id
                WHERE c.status = 'published'
            `);
            
            return res.json(result.rows.map(course => ({
                name: course.name,
                description: course.description,
                price: parseFloat(course.price),
                themes: [course.category_name],
                level: course.education_level.toLowerCase().replace(' level', ''),
                author: course.author_name
            })));
        } catch (error) {
            console.error('Database error:', error);
            // Fallback до локальних даних
            return res.json(coursesData);
        }
    }

    try {
        // Спробуємо спочатку пошук в базі даних
        const dbResults = await searchDatabase(query);
        
        if (dbResults) {
            return res.json(dbResults);
        }
        
        // Якщо пошук в базі даних не вдався, використовуємо локальні дані
        const fuse = new Fuse(coursesData, fuseOptions);
        const results = fuse.search(query).map(result => result.item);
        
        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Новий маршрут для підказок
router.get('/suggestions', async (req, res) => {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
        return res.json([]);
    }

    try {
        const suggestions = await pool.query(`
            SELECT name, description
            FROM all_courses
            WHERE 
                status = 'published' AND
                (name ILIKE $1 OR description ILIKE $1)
            LIMIT 5
        `, [`%${query}%`]);
        
        res.json(suggestions.rows);
    } catch (error) {
        console.error('Suggestions error:', error);
        // Fallback до локальних даних
        const localSuggestions = coursesData
            .filter(course => 
                course.name.toLowerCase().includes(query.toLowerCase()) ||
                course.description.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 5);
        
        res.json(localSuggestions);
    }
});

module.exports = router;
