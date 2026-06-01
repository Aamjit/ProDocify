# Database Migration Guide

## Overview

The ProDocify backend needs database migrations for:
1. **Document Versioning** - DocumentVersion table
2. **Team Collaboration** - Team, TeamMember, TeamFolder, TeamDocument, TeamDocumentVersion tables

## Current Status

✅ **Prisma Schema** - Updated with all new models
✅ **Services** - Implemented and ready to use
✅ **DTOs** - Created with validation
✅ **Controllers** - Ready to build

⏳ **Database Migration** - Needs to be executed

---

## How to Run Migrations

### Option 1: Using npm script (Recommended)

```bash
cd backend
npm run prisma:migrate:dev
```

This will:
1. Create a new migration based on schema changes
2. Apply the migration to your database
3. Generate Prisma Client

### Option 2: Using Prisma CLI directly

```bash
cd backend
npx prisma migrate dev --name "add-teams-and-versioning"
```

### Option 3: Using Docker (if database is containerized)

```bash
docker exec -it [postgres-container] psql -U [user] -d [database] -f migration.sql
```

---

## What Gets Created

### New Tables

#### 1. DocumentVersion
```sql
CREATE TABLE "DocumentVersion" (
    "id" TEXT PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "changelog" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "createdBy" TEXT NOT NULL,
    UNIQUE(documentId, versionNumber),
    FOREIGN KEY(documentId) REFERENCES "Document"(id) ON DELETE CASCADE,
    FOREIGN KEY(createdBy) REFERENCES "User"(id)
);
```

#### 2. Team
```sql
CREATE TABLE "Team" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    UNIQUE(ownerId, name),
    FOREIGN KEY(ownerId) REFERENCES "User"(id) ON DELETE CASCADE
);
```

#### 3. TeamMember
```sql
CREATE TABLE "TeamMember" (
    "id" TEXT PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT DEFAULT 'VIEWER',
    "joinedAt" TIMESTAMP DEFAULT NOW(),
    UNIQUE(teamId, userId),
    FOREIGN KEY(teamId) REFERENCES "Team"(id) ON DELETE CASCADE,
    FOREIGN KEY(userId) REFERENCES "User"(id) ON DELETE CASCADE
);
```

#### 4. TeamFolder
```sql
CREATE TABLE "TeamFolder" (
    "id" TEXT PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    UNIQUE(teamId, name),
    FOREIGN KEY(teamId) REFERENCES "Team"(id) ON DELETE CASCADE,
    FOREIGN KEY(createdBy) REFERENCES "User"(id)
);
```

#### 5. TeamDocument
```sql
CREATE TABLE "TeamDocument" (
    "id" TEXT PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "folderId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "ownerId" TEXT NOT NULL,
    "currentVersion" INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY(teamId) REFERENCES "Team"(id) ON DELETE CASCADE,
    FOREIGN KEY(folderId) REFERENCES "TeamFolder"(id) ON DELETE SET NULL,
    FOREIGN KEY(ownerId) REFERENCES "User"(id)
);
```

#### 6. TeamDocumentVersion
```sql
CREATE TABLE "TeamDocumentVersion" (
    "id" TEXT PRIMARY KEY,
    "teamDocumentId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "changelog" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "createdBy" TEXT NOT NULL,
    UNIQUE(teamDocumentId, versionNumber),
    FOREIGN KEY(teamDocumentId) REFERENCES "TeamDocument"(id) ON DELETE CASCADE
);
```

### Modified Tables

#### Document
```sql
ALTER TABLE "Document" ADD COLUMN "currentVersion" INTEGER DEFAULT 1;
```

### Indexes Created

```sql
-- Team indexes
CREATE UNIQUE INDEX "Team_ownerId_name_key" ON "Team"("ownerId", "name");
CREATE INDEX "Team_ownerId_idx" ON "Team"("ownerId");
CREATE INDEX "Team_createdAt_idx" ON "Team"("createdAt");

-- TeamMember indexes
CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");
CREATE INDEX "TeamMember_teamId_idx" ON "TeamMember"("teamId");
CREATE INDEX "TeamMember_userId_idx" ON "TeamMember"("userId");
CREATE INDEX "TeamMember_role_idx" ON "TeamMember"("role");

-- TeamFolder indexes
CREATE UNIQUE INDEX "TeamFolder_teamId_name_key" ON "TeamFolder"("teamId", "name");
CREATE INDEX "TeamFolder_teamId_idx" ON "TeamFolder"("teamId");

-- DocumentVersion indexes
CREATE UNIQUE INDEX "DocumentVersion_documentId_versionNumber_key" ON "DocumentVersion"("documentId", "versionNumber");
CREATE INDEX "DocumentVersion_documentId_idx" ON "DocumentVersion"("documentId");
CREATE INDEX "DocumentVersion_createdAt_idx" ON "DocumentVersion"("createdAt");
```

---

## Environment Setup

Before running migrations, ensure you have a `.env.local` file in the backend directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/prodocify"
```

### If using Docker Postgres:

```bash
# Start PostgreSQL container
docker run -d \
  --name prodocify-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=prodocify \
  -p 5432:5432 \
  postgres:15

# Update .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/prodocify"
```

---

## Verify Migration Success

### 1. Check Prisma Client is updated
```bash
npm run prisma:generate
```

### 2. Verify tables exist
```bash
npx prisma db execute --stdin < verify.sql
```

Where `verify.sql` contains:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 3. Check schema in database
```bash
npx prisma studio
```
This opens a visual database explorer at http://localhost:5555

---

## Troubleshooting

### Issue: "Cannot find module @prisma/client"
**Solution:**
```bash
npm install
npm run prisma:generate
```

### Issue: "Connection refused"
**Solution:** Ensure PostgreSQL is running and DATABASE_URL is correct
```bash
# Test connection
npx prisma db push --skip-generate
```

### Issue: "Migration already exists"
**Solution:** Either:
1. Delete the migration folder and try again
2. Reset the database: `npx prisma migrate reset`

### Issue: "Foreign key constraint failed"
**Solution:** Ensure migrations are run in order:
1. User table must exist first
2. Document table depends on User
3. Team depends on User
4. TeamMember depends on Team and User
5. etc.

Prisma handles this automatically, but if there are issues, run:
```bash
npx prisma migrate resolve --rolled-back
```

---

## After Migration Success

### 1. Update SQL todos
```sql
UPDATE todos SET status = 'done' 
WHERE id IN ('add-migration', 'migrate-team-schema');
```

### 2. Next step: Build Controllers
- TeamController (9 endpoints)
- TeamDocumentController (6 endpoints)

### 3. Build Services (if not already done)
- TeamDocumentService
- Integrate with versioning

### 4. Run Integration Tests
- Test team CRUD operations
- Test permission enforcement
- Test document versioning

---

## Migration History

| Date | Migration | Status |
|------|-----------|--------|
| 2026-05-13 | init | ✅ Applied |
| 2026-05-14 | add_password_to_user | ✅ Applied |
| 2026-05-23 | add_teams_and_versioning | ⏳ Pending |

---

## Rollback (if needed)

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back

# Or reset entire database (CAUTION: Deletes all data!)
npx prisma migrate reset
```

---

## Performance Tuning (Post-Migration)

After migration, consider:

1. **Add connection pooling** (for production)
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public&connection_limit=20"
```

2. **Enable slow query logging**
```sql
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();
```

3. **Monitor index usage**
```sql
SELECT schemaname, tablename, indexname, idx_scan 
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

---

## Support

If you encounter issues:

1. Check Prisma docs: https://www.prisma.io/docs/orm/reference/prisma-cli-reference#migrate
2. Check PostgreSQL logs: `docker logs prodocify-db`
3. Review schema: `npx prisma studio`

---

**Status:** Ready for migration execution ✅

Execute with: `npm run prisma:migrate:dev`

