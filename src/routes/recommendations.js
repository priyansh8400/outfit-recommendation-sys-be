const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

// GET /recommendations
// Query Params: gender, category, sub_category, exclude (id to ignore), limit
router.get('/', async (req, res) => {
    try {
        const { gender, category, sub_category, exclude, limit = 5 } = req.query;

        if (!gender || !category) {
            return res.status(400).json({ error: 'gender and category are required query parameters' });
        }

        const whereClause = {
            gender: gender,
            category: category,
        };

        if (sub_category) {
            whereClause.sub_category = sub_category;
        }

        if (exclude) {
            whereClause.id = {
                not: exclude
            };
        }

        const allMatching = await prisma.clothes.findMany({
            where: whereClause
        });

        // Randomly shuffle the results
        const shuffled = allMatching.sort(() => 0.5 - Math.random());
        const recommendations = shuffled.slice(0, parseInt(limit, 10));

        res.json(recommendations);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
