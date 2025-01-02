const express = require('express');
const Fuse = require('fuse.js');
const coursesData = require('./coursesData');
const router = express.Router();

const fuseOptions = {
    keys: ['name', 'description', 'themes'],
    threshold: 0.3,
    distance: 100
};

router.get('/search', (req, res) => {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
        return res.json(coursesData);
    }

    const fuse = new Fuse(coursesData, fuseOptions);
    const results = fuse.search(query).map(result => result.item);
    
    res.json(results);
});

module.exports = router;
