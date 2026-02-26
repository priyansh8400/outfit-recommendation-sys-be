const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const persons = await prisma.person.findMany({
        include: { outfits: true }
    });

    const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';

    for (const person of persons) {
        const gender = person.gender; // 'male' or 'female'
        const folder = gender === 'male' ? 'men' : 'women';

        console.log(`Assigning images for ${person.name} (${gender})...`);

        let i = 1;
        for (const outfit of person.outfits) {
            const imageUrl = `${API_URL}/images/${folder}/outfit-${i}.jpg`;
            await prisma.outfit.update({
                where: { id: outfit.id },
                data: { image_url: imageUrl }
            });
            console.log(`  - Updated outfit ${outfit.id} with ${imageUrl}`);

            i++;
            if (i > 5) {
                // In case there are more than 5 outfits per persona in the future
                console.log(`  (Note: Reached outfit ${i} - you will need more images if we expand beyond 5)`);
            }
        }
    }

    console.log("Migration complete!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
