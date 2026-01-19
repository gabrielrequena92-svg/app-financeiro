import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users. Starting password reset...`);

    for (const user of users) {
        // If password doesn't look like a bcrypt hash, hash it.
        // Bcrypt hashes usually start with $2
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
