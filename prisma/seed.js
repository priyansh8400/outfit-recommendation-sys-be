const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const personsData = [
    { name: 'Robert', gender: 'male', image_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80' },
    { name: 'Sophia', gender: 'female', image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80' }
];

const outfitPlans = {
    'Robert': [
        { type: 'regular', topColor: 'white', bottomColor: 'blue', image_url: 'https://images.unsplash.com/photo-1516826957135-700ede19f694?w=800&q=80' },
        { type: 'regular', topColor: 'black', bottomColor: 'black', image_url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=80' },
        { type: 'regular', topColor: 'grey', bottomColor: 'grey', image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80' },
        { type: 'regular', topColor: 'blue', bottomColor: 'beige', image_url: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=800&q=80' },
        { type: 'regular', topColor: 'white', bottomColor: 'black', image_url: 'https://images.unsplash.com/photo-1594938298596-ec6549298419?w=800&q=80' }
    ],
    'Sophia': [
        { type: 'dress', topColor: 'yellow', bottomColor: '', image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80' },
        { type: 'regular', topColor: 'yellow', bottomColor: 'blue', image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80' },
        { type: 'regular', topColor: 'brown', bottomColor: 'black', image_url: 'https://images.unsplash.com/photo-1550614000-4b95d466e855?w=800&q=80' },
        { type: 'regular', topColor: 'grey', bottomColor: 'grey', image_url: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&q=80' },
        { type: 'regular', topColor: 'grey', bottomColor: 'black', image_url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&q=80' }
    ]
};

function findBestMatch(items, colorWord) {
    if (!items || items.length === 0) return null;
    let match = items.find(i => (i.color && i.color.toLowerCase().includes(colorWord)) || (i.name && i.name.toLowerCase().includes(colorWord)));
    if (!match) {
        match = items[Math.floor(Math.random() * items.length)];
    }
    return match;
}

async function main() {
    console.log('Seeding persons...');

    // Clear existing persons and outfits
    await prisma.outfit.deleteMany({});
    await prisma.person.deleteMany({});

    for (const p of personsData) {
        // 1. Create Person
        const person = await prisma.person.create({
            data: p,
        });

        console.log(`Created person: ${person.name} (${person.gender})`);

        // 2. Fetch all clothes for this gender
        let tops = await prisma.clothes.findMany({ where: { gender: person.gender, category: 'top' } });
        let bottoms = await prisma.clothes.findMany({ where: { gender: person.gender, category: 'bottom' } });
        let shoesList = await prisma.clothes.findMany({ where: { gender: person.gender, category: 'shoes' } });
        let dresses = await prisma.clothes.findMany({ where: { gender: person.gender, category: 'dress' } });

        // Fallback dummy items if the scraper hasn't finished yet
        if (tops.length === 0) {
            tops.push(await prisma.clothes.create({ data: { name: 'Basic Top', gender: person.gender, category: 'top', sub_category: 't-shirt', image_url: 'https://placehold.co/400x600/EEE/31343C?text=Top', price: 999 } }));
        }
        if (bottoms.length === 0) {
            bottoms.push(await prisma.clothes.create({ data: { name: 'Classic Bottom', gender: person.gender, category: 'bottom', sub_category: 'jeans', image_url: 'https://placehold.co/400x600/EEE/31343C?text=Bottom', price: 1499 } }));
        }
        if (shoesList.length === 0) {
            shoesList.push(await prisma.clothes.create({ data: { name: 'Comfort Shoes', gender: person.gender, category: 'shoes', sub_category: 'sneakers', image_url: 'https://placehold.co/400x600/EEE/31343C?text=Shoes', price: 2499 } }));
        }
        if (dresses.length === 0 && person.gender === 'female') {
            dresses.push(await prisma.clothes.create({ data: { name: 'Elegant Dress', gender: person.gender, category: 'dress', sub_category: 'midi', image_url: 'https://placehold.co/400x600/EEE/31343C?text=Dress', price: 3999 } }));
        }

        const plans = outfitPlans[person.name];

        for (let i = 0; i < plans.length; i++) {
            const plan = plans[i];
            try {
                if (plan.type === 'dress' && dresses.length > 0) {
                    const dress = findBestMatch(dresses, plan.topColor);
                    const shoes = shoesList[Math.floor(Math.random() * shoesList.length)];

                    if (dress && shoes) {
                        await prisma.outfit.create({
                            data: {
                                person_id: person.id,
                                dress_id: dress.id,
                                shoes_id: shoes.id,
                                image_url: plan.image_url
                            }
                        });
                        console.log(`  -> Created outfit ${i + 1} (Dress) for ${person.name}`);
                    }
                } else {
                    const top = findBestMatch(tops, plan.topColor);
                    const bottom = findBestMatch(bottoms, plan.bottomColor);
                    const shoes = shoesList[Math.floor(Math.random() * shoesList.length)];

                    if (top && bottom && shoes) {
                        await prisma.outfit.create({
                            data: {
                                person_id: person.id,
                                top_id: top.id,
                                bottom_id: bottom.id,
                                shoes_id: shoes.id,
                                image_url: plan.image_url
                            }
                        });
                        console.log(`  -> Created outfit ${i + 1} (Regular) for ${person.name}`);
                    } else {
                        console.log(`  -> Missing regular clothing data for ${person.name} on outfit ${i + 1}`);
                    }
                }
            } catch (err) {
                console.error(`  -> Failed creating outfit ${i + 1} for ${person.name}`, err);
            }
        }
    }

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
