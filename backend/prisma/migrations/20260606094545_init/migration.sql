/*
  Warnings:

  - The `role` column on the `TeamMember` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "TeamMember" DROP COLUMN "role",
ADD COLUMN     "role" "SharePermission" NOT NULL DEFAULT 'VIEWER';

-- CreateIndex
CREATE INDEX "TeamMember_role_idx" ON "TeamMember"("role");
