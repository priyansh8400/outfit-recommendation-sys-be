const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

// GET /persons - Returns list of homepage models
router.get('/', async (req, res) => {
    try {
        const persons = await prisma.person.findMany();
        res.json(persons);
    } catch (error) {
        console.error('Error fetching persons:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
