const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users. Starting password reset...`);

    for (const user of users) {
        if (!user.password.startsWith('$2')) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            });
            console.log(`Password for user ${user.email} has been hashed.`);
        } else {
            console.log(`User ${user.email} already has a hashed password. Skipping.`);
        }
    }

    console.log('Password reset complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
