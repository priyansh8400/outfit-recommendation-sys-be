const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

// GET /persons - Returns list of homepage models (optional ?gender=male|female)
router.get('/', async (req, res) => {
    try {
        const { gender } = req.query;
        let whereClause = {};
        if (gender === 'male' || gender === 'female') {
            whereClause.gender = gender;
        }

        const persons = await prisma.person.findMany({
            where: whereClause
        });
        res.json(persons);
    } catch (error) {
        console.error('Error fetching persons:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /persons/:id/outfit - Deprecated/Replaced, but can stay for backwards compat.
// Adding GET /persons/:id/outfits to return ALL outfits for a persona
router.get('/:id/outfits', async (req, res) => {
    try {
        const { id } = req.params;

        const person = await prisma.person.findUnique({
            where: { id },
            include: {
                outfits: {
                    include: {
                        top: true,
                        bottom: true,
                        shoes: true,
                        dress: true
                    }
                }
            }
        });

        if (!person) {
            return res.status(404).json({ error: 'Person not found' });
        }

        const formattedOutfits = person.outfits.map(outfit => {
            const isDressOutfit = !!outfit.dress;
            if (isDressOutfit) {
                return {
                    id: outfit.id,
                    outfitType: "dress",
                    image_url: outfit.image_url,
                    dress: outfit.dress,
                    shoes: outfit.shoes
                };
            } else {
                return {
                    id: outfit.id,
                    outfitType: "regular",
                    image_url: outfit.image_url,
                    top: outfit.top,
                    bottom: outfit.bottom,
                    shoes: outfit.shoes
                };
            }
        });

        res.json({
            person: {
                id: person.id,
                name: person.name,
                gender: person.gender,
                image_url: person.image_url
            },
            outfits: formattedOutfits
        });

    } catch (error) {
        console.error(`Error fetching outfits for person ${req.params.id}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
