const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting full database reset...');

    // Order matters because of FKs if not using TRUNCATE CASCADE
    // We'll do it in reverse order of dependencies
    await prisma.transaction.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.recurringExpense.deleteMany();
    await prisma.category.deleteMany();
    await prisma.account.deleteMany();
    await prisma.contextUser.deleteMany();
    await prisma.context.deleteMany();
    await prisma.user.deleteMany();

    console.log('Database wiped successfully. You can now register a new account.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
