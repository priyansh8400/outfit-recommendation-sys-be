const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const personsData = [
    { name: 'Alex', gender: 'male', image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80' },
    { name: 'Sarah', gender: 'female', image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80' },
    { name: 'Mike', gender: 'male', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80' },
    { name: 'Emily', gender: 'female', image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80' },
    { name: 'David', gender: 'male', image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80' },
];

async function main() {
    console.log('Seeding persons...');

    // Clear existing persons and outfits (cascade will handle outfits if set, but we'll do it cleanly)
    await prisma.outfit.deleteMany({});
    await prisma.person.deleteMany({});

    for (const p of personsData) {
        // 1. Create Person
        const person = await prisma.person.create({
            data: p,
        });

        console.log(`Created person: ${person.name} (${person.gender})`);

        // 2. Find random clothes for this person's gender
        const tops = await prisma.clothes.findMany({ where: { gender: person.gender, category: 'top' } });
        const bottoms = await prisma.clothes.findMany({ where: { gender: person.gender, category: 'bottom' } });
        const shoesList = await prisma.clothes.findMany({ where: { gender: person.gender, category: 'shoes' } });

        if (tops.length > 0 && bottoms.length > 0 && shoesList.length > 0) {
            // Pick random items
            const randomTop = tops[Math.floor(Math.random() * tops.length)];
            const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
            const randomShoes = shoesList[Math.floor(Math.random() * shoesList.length)];

            // 3. Create Outfit
            await prisma.outfit.create({
                data: {
                    person_id: person.id,
                    top_id: randomTop.id,
                    bottom_id: randomBottom.id,
                    shoes_id: randomShoes.id,
                },
            });
            console.log(`  -> Created outfit for ${person.name}`);
        } else {
            console.log(`  -> Could not create outfit for ${person.name} due to missing clothing data in DB for gender: ${person.gender}. Make sure scraper has populated products.`);
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
