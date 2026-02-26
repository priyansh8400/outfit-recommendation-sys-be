const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

// Helper function to get recommendations
async function getRecommendations(gender, category, sub_category, excludeId, limit = 5) {
    const allMatching = await prisma.clothes.findMany({
        where: {
            gender,
            category,
            sub_category,
            id: { not: excludeId }
        }
    });

    // Randomize the selection
    const shuffled = allMatching.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
}

// GET /outfit/:personId/:outfitId - Returns person, specific outfit details, AND recommendations
router.get('/:personId/:outfitId', async (req, res) => {
    try {
        const { personId, outfitId } = req.params;

        // 1. Fetch Person and current outfit details
        const person = await prisma.person.findUnique({
            where: { id: personId },
            include: {
                outfits: {
                    where: { id: outfitId },
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

        const currentOutfit = person.outfits[0];

        if (!currentOutfit) {
            return res.status(404).json({ error: 'Outfit not found for this person' });
        }

        const isDressOutfit = !!currentOutfit.dress;
        const outfitType = isDressOutfit ? "dress" : "regular";

        let recommendations = null;
        let wearing = null;

        if (isDressOutfit) {
            // 2a. Fetch recommendations for dress outfit
            const [dressRecommendations, shoesRecommendations] = await Promise.all([
                getRecommendations(person.gender, 'dress', currentOutfit.dress.sub_category, currentOutfit.dress.id),
                getRecommendations(person.gender, 'shoes', currentOutfit.shoes.sub_category, currentOutfit.shoes.id)
            ]);

            wearing = {
                dress: currentOutfit.dress,
                shoes: currentOutfit.shoes,
                image_url: currentOutfit.image_url,
                outfitType
            };

            recommendations = {
                dress: dressRecommendations,
                shoes: shoesRecommendations
            };
        } else {
            // 2b. Fetch recommendations for regular outfit (top + bottom + shoes)
            const [topRecommendations, bottomRecommendations, shoesRecommendations] = await Promise.all([
                getRecommendations(person.gender, 'top', currentOutfit.top?.sub_category, currentOutfit.top?.id),
                getRecommendations(person.gender, 'bottom', currentOutfit.bottom?.sub_category, currentOutfit.bottom?.id),
                getRecommendations(person.gender, 'shoes', currentOutfit.shoes.sub_category, currentOutfit.shoes.id)
            ]);

            wearing = {
                top: currentOutfit.top,
                bottom: currentOutfit.bottom,
                shoes: currentOutfit.shoes,
                image_url: currentOutfit.image_url,
                outfitType
            };

            recommendations = {
                top: topRecommendations,
                bottom: bottomRecommendations,
                shoes: shoesRecommendations
            };
        }

        // 3. Construct Final Response
        res.json({
            person: {
                id: person.id,
                name: person.name,
                gender: person.gender,
                image_url: person.image_url
            },
            wearing,
            recommendations
        });

    } catch (error) {
        console.error(`Error fetching full outfit for person ${req.params.personId}:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
