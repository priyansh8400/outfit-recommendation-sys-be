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

// GET /persons/:id/outfit - Returns person + worn clothes
router.get('/:id/outfit', async (req, res) => {
    try {
        const { id } = req.params;

        const person = await prisma.person.findUnique({
            where: { id },
            include: {
                outfits: {
                    include: {
                        top: true,
                        bottom: true,
                        shoes: true
                    }
                }
            }
        });

        if (!person) {
            return res.status(404).json({ error: 'Person not found' });
        }

        // Format response to return person details and their current outfit
        const currentOutfit = person.outfits[0] || null;
        let wearing = null;

        if (currentOutfit) {
            wearing = {
                top: currentOutfit.top,
                bottom: currentOutfit.bottom,
                shoes: currentOutfit.shoes
            };
        }

        res.json({
            person: {
                id: person.id,
                name: person.name,
                gender: person.gender,
                image_url: person.image_url
            },
            wearing
        });

    } catch (error) {
        console.error(`Error fetching outfit for person ${req.params.id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
