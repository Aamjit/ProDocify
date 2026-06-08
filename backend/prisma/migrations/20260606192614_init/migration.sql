-- CreateEnum
CREATE TYPE "AccountAuthType" AS ENUM ('GOOGLE_OAUTH', 'EMAIL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountAuthType" "AccountAuthType" NOT NULL DEFAULT 'EMAIL',
ALTER COLUMN "password" DROP NOT NULL;
