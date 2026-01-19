-- CreateEnum
CREATE TYPE "RecurrenceType" AS ENUM ('FIXED', 'VARIABLE');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "installmentNumber" INTEGER,
ADD COLUMN     "installmentsTotal" INTEGER;

-- CreateTable
CREATE TABLE "RecurringExpense" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(65,30),
    "type" "RecurrenceType" NOT NULL,
    "dayOfMonth" INTEGER NOT NULL,
    "notificationDaysBefore" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "contextId" TEXT NOT NULL,
    "categoryId" TEXT,
    "sourceAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringExpense_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RecurringExpense" ADD CONSTRAINT "RecurringExpense_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "Context"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringExpense" ADD CONSTRAINT "RecurringExpense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringExpense" ADD CONSTRAINT "RecurringExpense_sourceAccountId_fkey" FOREIGN KEY ("sourceAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
