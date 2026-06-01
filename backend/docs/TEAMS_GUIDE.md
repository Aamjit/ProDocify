# Team & Collaboration Feature - Implementation Guide

## Overview

This document describes the team and collaboration feature implementation for ProDocify. Teams enable multiple users to collaborate on documents with role-based access control.

## Architecture

### Database Schema

**Core Models:**
1. **Team** - Represents a workspace/team
   - Unique name per owner (ownerId, name)
   - Owner has full control
   - Cascading deletes

2. **TeamMember** - Tracks membership with roles
   - Unique constraint: (teamId, userId)
   - Roles: ADMIN, EDITOR, VIEWER
   - Automatic cascade delete

3. **TeamDocument** - Documents within teams
   - Separate from personal documents
   - Owned by individual creator but belongs to team
   - Version control via TeamDocumentVersion

4. **TeamFolder** - Organize documents within teams
   - Hierarchical organization
   - Unique name per team

### Role Hierarchy

```
ADMIN (Full Control)
├── Create/edit/delete any document
├── Manage team members (add/remove/change roles)
├── Update team settings
└── Delete team

EDITOR (Write Access)
├── Create documents
├── Edit own documents
├── Edit shared documents
└── Delete own documents

VIEWER (Read-Only)
└── Read all team documents
```

## Services Overview

### TeamService
Manages team CRUD operations and membership queries.

**Key Methods:**
```typescript
createTeam(userId, data)           // Create new team
getTeam(teamId, userId)            // Get team details
listUserTeams(userId)              // List user's teams
updateTeam(teamId, userId, data)   // Update team info
deleteTeam(teamId, userId)         // Delete team
getTeamMembers(teamId, userId)     // List members
verifyTeamMembership(teamId, userId)
verifyTeamOwnership(teamId, userId)
```

### TeamMemberService
Manages team membership and roles.

**Key Methods:**
```typescript
addTeamMember(teamId, userId, data)        // Add member
removeTeamMember(teamId, memberId, userId) // Remove member
updateMemberRole(teamId, memberId, userId, data)
getTeamMember(teamId, memberId)
getUserTeamMembership(teamId, userId)
canAccessTeamDocument(userId, documentId)
canEditTeamDocument(userId, documentId)
```

### PermissionService
Authorization helper service for all permission checks.

**Key Methods:**
```typescript
canAccessTeam(userId, teamId)           // User is member
canManageTeam(userId, teamId)           // User is owner or admin
isTeamOwner(userId, teamId)
canAccessTeamDocument(userId, documentId)
canEditTeamDocument(userId, documentId)
canDeleteTeamDocument(userId, documentId)
canManageTeamMembers(userId, teamId)
getUserTeamRole(userId, teamId)
hasTeamRole(userId, teamId, role)
```

## API Endpoints

### Team Management

**POST /teams**
Create a new team.
```bash
curl -X POST http://localhost:3000/teams \
  -H "Authorization: Bearer $token" \
  -d '{
    "name": "Engineering Team",
    "description": "Main engineering team"
  }'
```

**GET /teams**
List user's teams.
```bash
curl http://localhost:3000/teams?skip=0&take=20 \
  -H "Authorization: Bearer $token"
```

**GET /teams/:teamId**
Get team details.
```bash
curl http://localhost:3000/teams/team-123 \
  -H "Authorization: Bearer $token"
```

**PUT /teams/:teamId**
Update team (owner only).
```bash
curl -X PUT http://localhost:3000/teams/team-123 \
  -H "Authorization: Bearer $token" \
  -d '{"name": "Updated Name"}'
```

**DELETE /teams/:teamId**
Delete team (owner only).
```bash
curl -X DELETE http://localhost:3000/teams/team-123 \
  -H "Authorization: Bearer $token"
```

### Team Members

**GET /teams/:teamId/members**
List team members.
```bash
curl http://localhost:3000/teams/team-123/members \
  -H "Authorization: Bearer $token"
```

**POST /teams/:teamId/members**
Add member to team (admin only).
```bash
curl -X POST http://localhost:3000/teams/team-123/members \
  -H "Authorization: Bearer $token" \
  -d '{
    "email": "user@example.com",
    "role": "EDITOR"
  }'
```

**PUT /teams/:teamId/members/:memberId**
Update member role (admin only).
```bash
curl -X PUT http://localhost:3000/teams/team-123/members/member-456 \
  -H "Authorization: Bearer $token" \
  -d '{"role": "ADMIN"}'
```

**DELETE /teams/:teamId/members/:memberId**
Remove member from team (admin only).
```bash
curl -X DELETE http://localhost:3000/teams/team-123/members/member-456 \
  -H "Authorization: Bearer $token"
```

## Authorization Flow

### Permission Checks

All endpoints follow this pattern:

1. **Authenticate** - Verify JWT token and extract user
2. **Check Membership** - Verify user is team member
3. **Check Role** - Verify user has required role
4. **Execute** - Perform operation
5. **Log** - Audit operation

### Example: Update Team Document

```typescript
async updateTeamDocument(teamId, docId, userId, data) {
  // 1. Verify user is team member
  const membership = await permissionService.canAccessTeam(userId, teamId);
  if (!membership) throw ForbiddenException;

  // 2. Verify user can edit
  const canEdit = await permissionService.canEditTeamDocument(userId, docId);
  if (!canEdit) throw ForbiddenException;

  // 3. Update document
  return await teamDocumentService.update(docId, data);
}
```

## DTOs

### CreateTeamDto
```typescript
{
  name: string              // 1-100 chars
  description?: string      // Optional, max 500 chars
}
```

### UpdateTeamDto
```typescript
{
  name?: string            // Optional
  description?: string
}
```

### AddTeamMemberDto
```typescript
{
  email: string           // Valid email
  role: string            // ADMIN | EDITOR | VIEWER
}
```

### UpdateTeamMemberDto
```typescript
{
  role: string            // ADMIN | EDITOR | VIEWER
}
```

### TeamResponseDto
```typescript
{
  id: string
  name: string
  description?: string
  ownerId: string
  members?: TeamMemberResponseDto[]
  memberCount?: number
  documentCount?: number
  createdAt: Date
  updatedAt: Date
}
```

## Error Handling

| Error | Status | Meaning |
|-------|--------|---------|
| Team not found | 404 | Team ID invalid or deleted |
| Not a team member | 403 | User not in team |
| Permission denied | 403 | User lacks required role |
| User not found | 404 | Email not registered |
| Already a member | 400 | User already in team |
| Cannot remove yourself | 400 | Invalid operation |
| Team name exists | 400 | Name already used |
| Invalid role | 400 | Role not ADMIN/EDITOR/VIEWER |

## Database Constraints

```prisma
// Team name unique per owner
@@unique([ownerId, name])

// One membership per user per team
@@unique([teamId, userId])

// Cascading deletes
@relation(..., onDelete: Cascade)
```

## Transaction Safety

All member operations use transactions to prevent race conditions:

```typescript
const member = await prisma.$transaction(async (tx) => {
  // Verify
  // Add/Update/Delete
  // Return result
});
```

## Security Considerations

✅ Authorization checks on all operations
✅ Role verification before data access
✅ Team membership enforced
✅ User email validation
✅ Generic error messages
✅ Audit logging of all operations
✅ Cascading deletes prevent orphaned data

## Performance Optimizations

1. **Indexes on Key Fields:**
   - (ownerId, name) - Team lookups
   - (teamId) - Member queries
   - (teamId, userId) - Membership checks
   - (createdAt) - Sorting

2. **Selective Includes:**
   - Fetch members only when needed
   - Use pagination (default 20/50)
   - Index createdAt for sorting

3. **Query Patterns:**
   - Use findFirst for single lookups
   - Use findMany for lists with pagination
   - Use count separately if needed

## Configuration

### Role Permissions Matrix

| Permission | ADMIN | EDITOR | VIEWER |
|------------|-------|--------|--------|
| View documents | ✓ | ✓ | ✓ |
| Create documents | ✓ | ✓ | ✗ |
| Edit own docs | ✓ | ✓ | ✗ |
| Edit shared docs | ✓ | ✓ | ✗ |
| Delete own docs | ✓ | ✓ | ✗ |
| Delete any doc | ✓ | ✗ | ✗ |
| Manage members | ✓ | ✗ | ✗ |
| Update team | ✓ | ✗ | ✗ |
| Delete team | ✓ | ✗ | ✗ |

## Migration Path

**Phase 1 (Current):**
- Team CRUD (done)
- Member management (done)
- Permission service (done)

**Phase 2 (Next):**
- TeamDocumentService
- Team document endpoints
- Migrate versioning to TeamDocuments

**Phase 3 (Future):**
- Team folders
- Document sharing
- Notifications

## Testing Strategy

### Unit Tests
- Permission checks
- Role validation
- Authorization logic

### Integration Tests
- End-to-end team workflows
- Member management
- Permission enforcement

### Scenarios to Test
1. Create team and add members
2. Change member roles
3. Remove members
4. Verify VIEWER cannot edit
5. Verify EDITOR cannot delete
6. Verify ADMIN has full access
7. Test cascading deletes

## Monitoring

**Metrics to Track:**
- Teams created per day
- Members per team (average)
- Role distribution (ADMIN/EDITOR/VIEWER)
- Permission check failures
- Unauthorized access attempts

**Logging Points:**
- Team CRUD operations
- Member additions/removals
- Role changes
- Permission denials
- Cascading deletes

## Future Enhancements

1. **Team Roles:** Custom roles beyond ADMIN/EDITOR/VIEWER
2. **Team Invitations:** Email-based invites with expiry
3. **Team Settings:** Public/private, audit logs
4. **Org Hierarchy:** Parent/child teams
5. **Advanced Sharing:** Per-document permissions
6. **Notifications:** Member activity notifications
7. **Audit Trail:** Complete audit log

---

**Status:** Core implementation complete
**Version:** 1.0
**Last Updated:** May 23, 2026

