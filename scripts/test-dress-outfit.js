const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTestDressOutfit() {
    console.log('Adding test dress and outfit for Sarah...');

    try {
        // 1. Create a dummy dress in clothes table
        const dress = await prisma.clothes.create({
            data: {
                name: "Elegant Black Midi Dress",
                gender: "female",
                category: "dress",
                sub_category: "midi",
                image_url: "https://hm.com/dummy-dress.jpg",
                brand: "hm.com",
            }
        });

        console.log(`Created test dress: ${dress.id}`);

        // 2. Find a female person (e.g. Sarah)
        const sarah = await prisma.person.findFirst({
            where: { name: 'Sarah', gender: 'female' },
            include: { outfits: true }
        });

        if (!sarah) {
            console.log('Sarah not found in DB.');
            return;
        }

        // 3. Clear her existing outfits
        await prisma.outfit.deleteMany({
            where: { person_id: sarah.id }
        });

        // 4. Find some shoes for her
        const shoes = await prisma.clothes.findFirst({
            where: { gender: 'female', category: 'shoes' }
        });

        if (!shoes) {
            console.log('No female shoes found in DB to pair with the dress.');
            return;
        }

        // 5. Create the new dress outfit
        const newOutfit = await prisma.outfit.create({
            data: {
                person_id: sarah.id,
                dress_id: dress.id, // Only dress and shoes, top/bottom remain null
                shoes_id: shoes.id
            }
        });

        console.log(`Successfully created dress outfit for Sarah! Outfit ID: ${newOutfit.id}`);

    } catch (e) {
        console.error("Error creating test dress outfit:", e);
    } finally {
        await prisma.$disconnect();
    }
}

addTestDressOutfit();
