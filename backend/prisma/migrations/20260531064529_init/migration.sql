-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'SHARED', 'TEAM', 'PUBLIC');

-- CreateEnum
CREATE TYPE "SharePermission" AS ENUM ('VIEWER', 'EDITOR', 'OWNER');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE';

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE';

-- CreateTable
CREATE TABLE "DocumentShare" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" "SharePermission" NOT NULL DEFAULT 'VIEWER',
    "grantedBy" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FolderShare" (
    "id" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" "SharePermission" NOT NULL DEFAULT 'VIEWER',
    "grantedBy" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FolderShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentShare_userId_idx" ON "DocumentShare"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentShare_documentId_userId_key" ON "DocumentShare"("documentId", "userId");

-- CreateIndex
CREATE INDEX "FolderShare_userId_idx" ON "FolderShare"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FolderShare_folderId_userId_key" ON "FolderShare"("folderId", "userId");

-- AddForeignKey
ALTER TABLE "DocumentShare" ADD CONSTRAINT "DocumentShare_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentShare" ADD CONSTRAINT "DocumentShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentShare" ADD CONSTRAINT "DocumentShare_grantedBy_fkey" FOREIGN KEY ("grantedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderShare" ADD CONSTRAINT "FolderShare_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderShare" ADD CONSTRAINT "FolderShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolderShare" ADD CONSTRAINT "FolderShare_grantedBy_fkey" FOREIGN KEY ("grantedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
