# Document Versioning Feature - Implementation Guide

## Overview

The ProDocify backend now includes a comprehensive document versioning system that allows users to track changes, maintain version history, and rollback to previous document states.

## Database Schema

### DocumentVersion Model

```prisma
model DocumentVersion {
  id            String    @id @default(uuid())
  documentId    String
  document      Document  @relation(fields: [documentId], references: [id], onDelete: Cascade)
  versionNumber Int
  changelog     String?
  content       String
  createdAt     DateTime  @default(now())
  createdBy     String
  creator       User      @relation(fields: [createdBy], references: [id])

  @@unique([documentId, versionNumber])
  @@index([documentId])
  @@index([createdAt])
  @@index([createdBy])
}
```

### Document Model Updates

- Added `currentVersion: Int` field to track the latest version number
- Added `versions: DocumentVersion[]` relation to link versions

## Architecture

### Services

#### DocumentVersionService
Located in `src/documents/document-version.service.ts`

**Key Methods:**

1. **createVersion(documentId, userId, data)**
   - Creates a new version entry
   - Increments currentVersion counter
   - Updates document content
   - Returns version details with creator info

2. **getVersionHistory(documentId, userId, skip, take)**
   - Retrieves paginated version history
   - Default: 20 items per page
   - Includes creator information
   - Returns total count for pagination

3. **getVersion(documentId, versionNumber, userId)**
   - Fetches a specific version
   - Validates ownership
   - Returns full version details

4. **rollbackToVersion(documentId, versionNumber, userId)**
   - Creates a new version as rollback entry
   - Restores document content from target version
   - Maintains complete audit trail

5. **compareVersions(documentId, versionNumber1, versionNumber2, userId)**
   - Compares two versions
   - Returns basic diff metrics (content length, differences)

6. **deleteOldVersions(documentId, keepCount)**
   - Utility for archiving old versions
   - Keeps last 50 versions by default
   - Useful for storage optimization

### Modified DocumentsService

- `update(id, data, userId)` now automatically creates versions
- Extracts `changelog` from UpdateDocumentDto
- Calls DocumentVersionService.createVersion before updating document

## API Endpoints

All endpoints require JWT authentication via `@UseGuards(JwtAuthGuard)`

### Document Endpoints (Updated)

#### PATCH /documents/:id
**Update Document with Auto-Versioning**

Request:
```json
{
  "title": "Updated Title",
  "content": "# Updated content",
  "changelog": "Updated introduction section",
  "folderId": "folder-uuid"
}
```

Response: Updated document details

### Version History Endpoints

#### GET /documents/:id/versions
**Get Version History (Paginated)**

Query Parameters:
- `skip`: Number of versions to skip (default: 0)
- `take`: Number of versions to fetch (default: 20)

Response:
```json
{
  "versions": [
    {
      "id": "version-id",
      "documentId": "doc-id",
      "versionNumber": 2,
      "changelog": "Updated introduction",
      "content": "# Full content",
      "createdAt": "2024-01-15T10:30:00Z",
      "createdBy": "user-id",
      "creator": { "id": "user-id", "email": "user@example.com" }
    }
  ],
  "total": 10,
  "skip": 0,
  "take": 20
}
```

#### GET /documents/:id/versions/:versionNumber
**Get Specific Version**

Response: Single version object (see above)

#### POST /documents/:id/versions
**Create Version Manually**

Request:
```json
{
  "content": "# Document content",
  "changelog": "Manual version creation"
}
```

Response: Created version details

#### POST /documents/:id/versions/:versionNumber/rollback
**Rollback Document to Version**

Response:
```json
{
  "message": "Document rolled back to version 1",
  "version": { /* version details */ },
  "document": { /* updated document */ }
}
```

#### GET /documents/:id/versions/compare
**Compare Two Versions**

Query Parameters:
- `version1`: First version number
- `version2`: Second version number

Response:
```json
{
  "version1": { /* full version 1 data */ },
  "version2": { /* full version 2 data */ },
  "changes": {
    "oldLength": 1234,
    "newLength": 1567,
    "lengthDifference": 333
  }
}
```

## Data Transfer Objects (DTOs)

### CreateVersionDto
```typescript
{
  changelog?: string;      // Description of changes
  content: string;         // Document content
}
```

### VersionResponseDto
```typescript
{
  id: string;
  documentId: string;
  versionNumber: number;
  changelog?: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  creator?: User;
}
```

### RollbackDto
```typescript
{
  versionNumber: number;   // Target version to rollback to
}
```

### UpdateDocumentDto (Enhanced)
```typescript
{
  title?: string;
  content?: string;
  changelog?: string;      // NEW: Change description
  folderId?: string;
  ownerId?: string;
}
```

## Security & Authorization

- All endpoints require JWT authentication
- Document ownership validation on all operations
- Only document owner can:
  - View version history
  - Retrieve specific versions
  - Create new versions
  - Rollback versions
  - Compare versions

## Frontend Integration

### Workflow 1: Saving Document with Versioning

```typescript
// Frontend saves document
PATCH /documents/:documentId
{
  "title": "Updated Doc",
  "content": "# New content",
  "changelog": "Updated section 2"
}

// Backend automatically creates version and updates document
```

### Workflow 2: Viewing Version History

```typescript
// Get paginated history
GET /documents/:documentId/versions?skip=0&take=20

// User sees:
// - List of all versions with timestamps
// - Creator info and changelog
// - Option to view, compare, or rollback
```

### Workflow 3: Rollback to Previous Version

```typescript
// User selects version to rollback to
POST /documents/:documentId/versions/2/rollback

// Document content is restored
// New version created as rollback entry
// Full audit trail maintained
```

## Performance Considerations

### Database Indexes
- Composite index on (documentId, versionNumber) for fast lookups
- Index on documentId for history queries
- Index on createdAt for sorting recent changes
- Index on createdBy for user-specific queries

### Query Optimization
- Paginated history prevents large data transfers
- Lazy-load version content only when needed
- Creator info included with metadata to avoid N+1 queries

### Storage Strategy
Current implementation stores full content per version. Future optimizations:
1. **Delta Compression**: Store only differences (reduces storage ~90%)
2. **Snapshots**: Full snapshots every 10 versions + deltas between
3. **Archival**: Move old versions (>1 year) to cold storage

## Implementation Tasks

### Completed ✅
- [x] Update Prisma schema with DocumentVersion model
- [x] Create DocumentVersionService with all methods
- [x] Update DocumentsService to integrate versioning
- [x] Add version endpoints to DocumentsController
- [x] Create DTOs for version operations
- [x] Update UpdateDocumentDto with changelog field

### Pending
- [ ] Run Prisma migration: `prisma migrate dev --name add-versioning`
- [ ] Test versioning workflow end-to-end
- [ ] Generate Prisma client: `prisma generate`
- [ ] Add comprehensive API documentation

## Migration Instructions

```bash
# Generate Prisma client
npm run prisma:generate

# Create database migration
npm run prisma:migrate:dev

# When prompted, name it: add-versioning
```

## Testing Checklist

1. **Create Document**
   - Create new document (version 1)
   - Verify currentVersion = 1

2. **Update Document**
   - Update document content
   - Verify version 2 created automatically
   - Verify currentVersion incremented to 2

3. **View History**
   - Fetch version history
   - Verify all versions returned with pagination
   - Verify creator info included

4. **Get Specific Version**
   - Retrieve version 1 content
   - Verify matches initial content

5. **Compare Versions**
   - Compare version 1 and 2
   - Verify diff metrics calculated

6. **Rollback**
   - Rollback to version 1
   - Verify document content restored
   - Verify new version (3) created as rollback entry
   - Verify changelog shows "Rollback to version 1"

7. **Authorization**
   - Try accessing other user's versions (should fail)
   - Try modifying other user's document (should fail)

## Example Usage Flow

```bash
# 1. Create document
POST /documents
{
  "title": "My Doc",
  "content": "# Initial content",
  "ownerId": "user-123"
}
// Returns: doc with id=doc-1, currentVersion=1

# 2. Update document (triggers version 2)
PATCH /documents/doc-1
{
  "content": "# Updated content",
  "changelog": "Added more details"
}

# 3. View history
GET /documents/doc-1/versions?skip=0&take=20
// Returns: [version-2, version-1]

# 4. Get specific version
GET /documents/doc-1/versions/1
// Returns: full version 1 with original content

# 5. Compare versions
GET /documents/doc-1/versions/compare?version1=1&version2=2
// Returns: diff metrics

# 6. Rollback
POST /documents/doc-1/versions/1/rollback
// Document content restored to version 1
// New version 3 created as rollback entry
```

## Troubleshooting

### Migration Issues

If migration fails:
```bash
# Check migration status
npx prisma migrate status

# Reset database (development only)
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate
```

### Version Not Creating

- Ensure userId is passed to documents.service.update()
- Verify document owner matches userId
- Check content field is not null/empty

### Authorization Errors

- Verify JWT token is valid
- Ensure document ownerId matches authenticated user
- Check headers include `Authorization: Bearer <token>`

## Future Enhancements

1. **Delta-based Versioning**: Store only changes for better storage efficiency
2. **Version Tagging**: Allow users to tag important versions
3. **Branching**: Create document branches from versions
4. **Collaborative Editing**: Real-time collaboration with WebSocket support
5. **Change Highlighting**: Visual diff highlighting between versions
6. **Scheduled Backups**: Auto-create versions on schedule
7. **Export History**: Export full version history as PDF/JSON
