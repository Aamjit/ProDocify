-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT;

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamFolder" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamDocument" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "folderId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "ownerId" TEXT NOT NULL,
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamDocumentVersion" (
    "id" TEXT NOT NULL,
    "teamDocumentId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "changelog" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "TeamDocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Team_ownerId_idx" ON "Team"("ownerId");

-- CreateIndex
CREATE INDEX "Team_createdAt_idx" ON "Team"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Team_ownerId_name_key" ON "Team"("ownerId", "name");

-- CreateIndex
CREATE INDEX "TeamMember_teamId_idx" ON "TeamMember"("teamId");

-- CreateIndex
CREATE INDEX "TeamMember_userId_idx" ON "TeamMember"("userId");

-- CreateIndex
CREATE INDEX "TeamMember_role_idx" ON "TeamMember"("role");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");

-- CreateIndex
CREATE INDEX "TeamFolder_teamId_idx" ON "TeamFolder"("teamId");

-- CreateIndex
CREATE INDEX "TeamFolder_createdBy_idx" ON "TeamFolder"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "TeamFolder_teamId_name_key" ON "TeamFolder"("teamId", "name");

-- CreateIndex
CREATE INDEX "TeamDocument_teamId_idx" ON "TeamDocument"("teamId");

-- CreateIndex
CREATE INDEX "TeamDocument_folderId_idx" ON "TeamDocument"("folderId");

-- CreateIndex
CREATE INDEX "TeamDocument_ownerId_idx" ON "TeamDocument"("ownerId");

-- CreateIndex
CREATE INDEX "TeamDocumentVersion_teamDocumentId_idx" ON "TeamDocumentVersion"("teamDocumentId");

-- CreateIndex
CREATE INDEX "TeamDocumentVersion_createdAt_idx" ON "TeamDocumentVersion"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TeamDocumentVersion_teamDocumentId_versionNumber_key" ON "TeamDocumentVersion"("teamDocumentId", "versionNumber");

-- CreateIndex
CREATE INDEX "Document_ownerId_idx" ON "Document"("ownerId");

-- CreateIndex
CREATE INDEX "Document_folderId_idx" ON "Document"("folderId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamFolder" ADD CONSTRAINT "TeamFolder_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamFolder" ADD CONSTRAINT "TeamFolder_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamDocument" ADD CONSTRAINT "TeamDocument_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamDocument" ADD CONSTRAINT "TeamDocument_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "TeamFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamDocument" ADD CONSTRAINT "TeamDocument_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamDocumentVersion" ADD CONSTRAINT "TeamDocumentVersion_teamDocumentId_fkey" FOREIGN KEY ("teamDocumentId") REFERENCES "TeamDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamDocumentVersion" ADD CONSTRAINT "TeamDocumentVersion_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
