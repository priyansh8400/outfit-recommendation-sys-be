const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixBrokenImage() {
    console.log('Searching for dummy dress image...');

    // Check if the exact bad ID exists and delete it
    const dummyId = "2028cdb5-26ba-48a0-812d-ff8e600f0d41";

    try {
        const item = await prisma.clothes.findUnique({
            where: { id: dummyId }
        });

        if (item) {
            console.log(`Found broken item: ${item.name}. Deleting...`);
            // Delete related outfits first
            await prisma.outfit.deleteMany({
                where: {
                    OR: [
                        { dress_id: dummyId }
                    ]
                }
            });
            await prisma.clothes.delete({
                where: { id: dummyId }
            });
            console.log('Deleted successfully.');
        } else {
            console.log('Item not found by ID. Searching by image URL...');
            const badUrlItems = await prisma.clothes.findMany({
                where: { image_url: { contains: 'dummy-dress.jpg' } }
            });

            for (const badItem of badUrlItems) {
                console.log(`Found broken item: ${badItem.name}. Deleting...`);
                await prisma.outfit.deleteMany({
                    where: { OR: [{ dress_id: badItem.id }] }
                });
                await prisma.clothes.delete({
                    where: { id: badItem.id }
                });
            }
            console.log(`Deleted ${badUrlItems.length} items by image URL.`);
        }
    } catch (error) {
        console.error('Error fixing broken image:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixBrokenImage();
