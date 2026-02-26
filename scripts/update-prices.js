const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updatePrices() {
    try {
        console.log("Updating clothes table prices...");
        await prisma.$executeRawUnsafe(`
            UPDATE clothes 
            SET price = CASE 
                WHEN price IS NULL THEN floor(random() * (8000 - 2000 + 1) + 2000)
                WHEN price < 500 THEN CEIL(price * 83)
                ELSE price
            END;
        `);

        console.log("Updating raw_products table prices...");
        await prisma.$executeRawUnsafe(`
            UPDATE raw_products 
            SET price = CASE 
                WHEN price IS NULL THEN floor(random() * (8000 - 2000 + 1) + 2000)
                WHEN price < 500 THEN CEIL(price * 83)
                ELSE price
            END;
        `);

        console.log("All prices updated to INR successfully!");
    } catch (err) {
        console.error("Error updating prices:", err);
    } finally {
        await prisma.$disconnect();
    }
}

updatePrices();
