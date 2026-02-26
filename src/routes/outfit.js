const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

// Helper function to get recommendations
async function getRecommendations(gender, category, sub_category, excludeId, limit = 5) {
    return prisma.clothes.findMany({
        where: {
            gender,
            category,
            sub_category,
            id: { not: excludeId }
        },
        take: limit,
        orderBy: { created_at: 'desc' }
    });
}

// GET /outfit/:personId/full - Returns person, outfit details, AND recommendations for each category
router.get('/:personId/full', async (req, res) => {
    try {
        const { personId } = req.params;

        // 1. Fetch Person and current outfit details
        const person = await prisma.person.findUnique({
            where: { id: personId },
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

        const currentOutfit = person.outfits[0];

        if (!currentOutfit) {
            return res.json({
                person: {
                    id: person.id,
                    name: person.name,
                    gender: person.gender,
                    image_url: person.image_url
                },
                wearing: null,
                recommendations: null
            });
        }

        // 2. Fetch recommendations for each category simultaneously
        const [topRecommendations, bottomRecommendations, shoesRecommendations] = await Promise.all([
            getRecommendations(person.gender, 'top', currentOutfit.top.sub_category, currentOutfit.top.id),
            getRecommendations(person.gender, 'bottom', currentOutfit.bottom.sub_category, currentOutfit.bottom.id),
            getRecommendations(person.gender, 'shoes', currentOutfit.shoes.sub_category, currentOutfit.shoes.id)
        ]);

        // 3. Construct Final Response
        res.json({
            person: {
                id: person.id,
                name: person.name,
                gender: person.gender,
                image_url: person.image_url
            },
            wearing: {
                top: currentOutfit.top,
                bottom: currentOutfit.bottom,
                shoes: currentOutfit.shoes
            },
            recommendations: {
                top: topRecommendations,
                bottom: bottomRecommendations,
                shoes: shoesRecommendations
            }
        });

    } catch (error) {
        console.error(`Error fetching full outfit for person ${req.params.personId}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
