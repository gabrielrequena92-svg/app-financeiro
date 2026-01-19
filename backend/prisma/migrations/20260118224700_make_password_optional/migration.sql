-- AlterTable
ALTER TABLE "Context" ADD COLUMN     "features" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
