/*
  Warnings:

  - The values [ADMIN] on the enum `SharePermission` will be removed. If these variants are still used in the database, this will fail.
  - The `role` column on the `TeamMember` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');

-- First convert TeamMember.role to new TeamRole enum
ALTER TABLE "TeamMember" DROP COLUMN "role";
ALTER TABLE "TeamMember" ADD COLUMN "role" "TeamRole" NOT NULL DEFAULT 'VIEWER';

-- Now handle SharePermission enum changes
BEGIN;
CREATE TYPE "SharePermission_new" AS ENUM ('VIEWER', 'EDITOR', 'OWNER');
ALTER TABLE "public"."DocumentShare" ALTER COLUMN "permission" DROP DEFAULT;
ALTER TABLE "public"."FolderShare" ALTER COLUMN "permission" DROP DEFAULT;
ALTER TABLE "DocumentShare" ALTER COLUMN "permission" TYPE "SharePermission_new" USING ("permission"::text::"SharePermission_new");
ALTER TABLE "FolderShare" ALTER COLUMN "permission" TYPE "SharePermission_new" USING ("permission"::text::"SharePermission_new");
DROP TYPE "public"."SharePermission";
ALTER TYPE "SharePermission_new" RENAME TO "SharePermission";
ALTER TABLE "DocumentShare" ALTER COLUMN "permission" SET DEFAULT 'VIEWER';
ALTER TABLE "FolderShare" ALTER COLUMN "permission" SET DEFAULT 'VIEWER';
COMMIT;

-- CreateIndex
CREATE INDEX "TeamMember_role_idx" ON "TeamMember"("role");
