# Phase 2: Implementation Next Steps

## Current Status Summary

✅ **Phase 1 Complete:**
- Database schema designed and optimized
- 5 production services created (810 lines)
- 6 DTOs with validation
- Authorization and role guard system
- Comprehensive documentation (44KB+)

⏳ **Phase 2: In Progress**
- Prisma migrations (ready, see MIGRATION_GUIDE.md)
- 3 Controllers to build
- 1 Service to complete
- Integration testing

---

## Immediate Next Steps (2-3 Hours)

### Step 1: Run Database Migration (30 mins)
```bash
cd backend
npm run prisma:migrate:dev -- --name "add-teams-and-versioning"
```

**What happens:**
- Creates all 5 new tables
- Adds indices for performance
- Applies foreign key constraints
- Updates Prisma Client

**Verify:**
```bash
npx prisma studio  # Opens visual database explorer
```

---

### Step 2: Create TeamController (45 mins)

**File:** `src/teams/team.controller.ts`

**Endpoints to implement (9 total):**

```typescript
@Controller('teams')
@UseGuards(AuthGuard)
export class TeamController {
  constructor(
    private teamService: TeamService,
    private memberService: TeamMemberService,
    private permissionService: PermissionService,
  ) {}

  // Team Management (5 endpoints)
  @Post()
  async createTeam(@Body() dto: CreateTeamDto, @Req() req) {
    // Create team and auto-add owner as ADMIN
  }

  @Get()
  async listTeams(@Req() req, @Query() query: PaginationDto) {
    // List teams where user is member
  }

  @Get(':id')
  @UseGuards(RoleGuard)
  @RequireTeamRole('VIEWER', 'EDITOR', 'ADMIN')
  async getTeam(@Param('id') id: string, @Req() req) {
    // Get single team (with permission check)
  }

  @Put(':id')
  @UseGuards(RoleGuard)
  @RequireTeamRole('ADMIN')
  async updateTeam(@Param('id') id: string, @Body() dto: UpdateTeamDto, @Req() req) {
    // Update team info (ADMIN only)
  }

  @Delete(':id')
  async deleteTeam(@Param('id') id: string, @Req() req) {
    // Delete team (owner only)
  }

  // Member Management (4 endpoints)
  @Get(':id/members')
  @UseGuards(RoleGuard)
  @RequireTeamRole('VIEWER', 'EDITOR', 'ADMIN')
  async getMembers(@Param('id') id: string) {
    // List team members
  }

  @Post(':id/members')
  @UseGuards(RoleGuard)
  @RequireTeamRole('ADMIN')
  async addMember(@Param('id') id: string, @Body() dto: AddTeamMemberDto, @Req() req) {
    // Add member by email
  }

  @Put(':id/members/:memberId')
  @UseGuards(RoleGuard)
  @RequireTeamRole('ADMIN')
  async updateMemberRole(@Param('id') id: string, @Param('memberId') memberId: string, @Body() dto: UpdateTeamMemberDto, @Req() req) {
    // Update member role
  }

  @Delete(':id/members/:memberId')
  @UseGuards(RoleGuard)
  @RequireTeamRole('ADMIN')
  async removeMember(@Param('id') id: string, @Param('memberId') memberId: string, @Req() req) {
    // Remove member
  }
}
```

---

### Step 3: Create TeamDocumentService (45 mins)

**File:** `src/teams/team-document.service.ts`

**Core Methods (6 total):**

```typescript
@Injectable()
export class TeamDocumentService {
  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
    private versionService: DocumentVersionService,
  ) {}

  // 1. Create document in team
  async createTeamDocument(teamId: string, userId: string, dto: CreateTeamDocumentDto) {
    // Check permission: EDITOR or ADMIN
    // Create document
    // Return document with metadata
  }

  // 2. Get single document
  async getTeamDocument(teamId: string, documentId: string, userId: string) {
    // Check access permission
    // Fetch document with versions
    // Return with formatting
  }

  // 3. List team documents
  async listTeamDocuments(teamId: string, userId: string, query: PaginationDto) {
    // Check team membership
    // Return paginated documents
    // Include owner and modification date
  }

  // 4. Update document
  async updateTeamDocument(teamId: string, documentId: string, userId: string, dto: UpdateTeamDocumentDto) {
    // Check edit permission
    // Create version before update
    // Update document
    // Return updated document
  }

  // 5. Delete document
  async deleteTeamDocument(teamId: string, documentId: string, userId: string) {
    // Check delete permission
    // Delete document (cascades versions)
    // Return success
  }

  // 6. Get version history
  async getDocumentVersions(teamId: string, documentId: string, userId: string, query: PaginationDto) {
    // Check access permission
    // Return versions with pagination
    // Include creator info
  }
}
```

---

### Step 4: Create TeamDocumentController (45 mins)

**File:** `src/teams/team-document.controller.ts`

**Endpoints (6 total):**

```typescript
@Controller('teams/:teamId/documents')
@UseGuards(AuthGuard)
export class TeamDocumentController {
  constructor(private documentService: TeamDocumentService) {}

  @Post()
  @UseGuards(RoleGuard)
  @RequireTeamRole('EDITOR', 'ADMIN')
  async createDocument(@Param('teamId') teamId: string, @Body() dto: CreateTeamDocumentDto, @Req() req) {
    // Create new team document
  }

  @Get()
  @UseGuards(RoleGuard)
  @RequireTeamRole('VIEWER', 'EDITOR', 'ADMIN')
  async listDocuments(@Param('teamId') teamId: string, @Query() query: PaginationDto, @Req() req) {
    // List team documents
  }

  @Get(':docId')
  @UseGuards(RoleGuard)
  @RequireTeamRole('VIEWER', 'EDITOR', 'ADMIN')
  async getDocument(@Param('teamId') teamId: string, @Param('docId') docId: string, @Req() req) {
    // Get single document
  }

  @Put(':docId')
  @UseGuards(RoleGuard)
  @RequireTeamRole('EDITOR', 'ADMIN')
  async updateDocument(@Param('teamId') teamId: string, @Param('docId') docId: string, @Body() dto: UpdateTeamDocumentDto, @Req() req) {
    // Update document (auto-versioning)
  }

  @Delete(':docId')
  @UseGuards(RoleGuard)
  @RequireTeamRole('EDITOR', 'ADMIN')
  async deleteDocument(@Param('teamId') teamId: string, @Param('docId') docId: string, @Req() req) {
    // Delete document
  }

  @Get(':docId/versions')
  @UseGuards(RoleGuard)
  @RequireTeamRole('VIEWER', 'EDITOR', 'ADMIN')
  async getVersions(@Param('teamId') teamId: string, @Param('docId') docId: string, @Query() query: PaginationDto) {
    // Get document version history
  }
}
```

---

### Step 5: Create/Update Module (15 mins)

**File:** `src/teams/teams.module.ts`

```typescript
@Module({
  controllers: [
    TeamController,
    TeamDocumentController,
  ],
  providers: [
    TeamService,
    TeamMemberService,
    TeamDocumentService,
    PermissionService,
    RoleGuard,
  ],
})
export class TeamsModule {}
```

---

### Step 6: Integration Testing (30 mins)

**Test Scenarios:**

```typescript
describe('Teams', () => {
  describe('Team CRUD', () => {
    it('should create a team', async () => {
      // 1. Create team
      // 2. Verify owner is ADMIN
      // 3. Verify team name unique per owner
    });

    it('should list user teams', async () => {
      // 1. Create multiple teams
      // 2. List teams
      // 3. Verify count and pagination
    });

    it('should update team', async () => {
      // 1. Create team
      // 2. Update team info
      // 3. Verify update
    });

    it('should delete team', async () => {
      // 1. Create team with documents
      // 2. Delete team
      // 3. Verify cascade delete
    });
  });

  describe('Permissions', () => {
    it('should enforce ADMIN-only operations', async () => {
      // 1. Create team with ADMIN user
      // 2. Try operation as EDITOR
      // 3. Expect ForbiddenException
    });

    it('should allow VIEWER read-only', async () => {
      // 1. Create document
      // 2. Try to edit as VIEWER
      // 3. Expect ForbiddenException
    });

    it('should cascade permissions', async () => {
      // 1. Update member role
      // 2. Try operation with new role
      // 3. Verify permission change
    });
  });

  describe('Documents', () => {
    it('should create team document', async () => {
      // 1. Create team
      // 2. Create document in team
      // 3. Verify ownership and permissions
    });

    it('should auto-create versions on update', async () => {
      // 1. Create document
      // 2. Update document
      // 3. Verify version created
    });

    it('should list versions with pagination', async () => {
      // 1. Create document and versions
      // 2. Get version history
      // 3. Verify pagination and metadata
    });
  });
});
```

---

## Files to Create/Update

```
src/
├── teams/
│   ├── team.controller.ts              (NEW - 200 lines)
│   ├── team-document.controller.ts     (NEW - 150 lines)
│   ├── team-document.service.ts        (NEW - 250 lines)
│   ├── teams.module.ts                 (NEW - 50 lines)
│   └── tests/
│       ├── team.controller.spec.ts     (NEW - 300 lines)
│       ├── team-document.spec.ts       (NEW - 300 lines)
│       └── permissions.spec.ts         (NEW - 200 lines)
│
├── app.module.ts                       (UPDATE - add TeamsModule)
│
└── migrations/
    └── 20260523_add_teams_and_versioning/
        └── migration.sql               (NEW - created)
```

---

## Estimated Time Breakdown

| Task | Duration | Difficulty |
|------|----------|------------|
| Run Migration | 30 min | Easy |
| Create TeamController | 45 min | Medium |
| Create TeamDocumentService | 45 min | Medium |
| Create TeamDocumentController | 45 min | Medium |
| Integration Tests | 60 min | Medium |
| **Total** | **3.5 hours** | |

---

## Success Criteria

✅ All 9 team endpoints working
✅ All 6 document endpoints working
✅ Permission enforcement verified
✅ Auto-versioning on document update
✅ Role-based access working
✅ Cascading deletes working
✅ Pagination working
✅ All error cases handled

---

## Architecture Diagram

```
Request
  ↓
AuthGuard (JWT)
  ↓
TeamController
  ├─ POST   /teams              (Team CRUD)
  ├─ PUT    /teams/:id
  ├─ DELETE /teams/:id
  ├─ GET    /teams/:id/members  (Member management)
  └─ POST   /teams/:id/members
  
  ├─ POST   /teams/:id/documents              (Document CRUD)
  ├─ GET    /teams/:id/documents
  ├─ PUT    /teams/:id/documents/:id
  ├─ DELETE /teams/:id/documents/:id
  └─ GET    /teams/:id/documents/:id/versions (Versioning)
  ↓
RoleGuard (@RequireTeamRole)
  ↓
Service
  (TeamService, TeamDocumentService, PermissionService)
  ↓
PrismaService (Database)
  ↓
PostgreSQL
```

---

## Next Phase (After Controllers)

1. **Frontend Integration**
   - Update Swagger docs with new endpoints
   - Share with frontend team
   - API contract testing

2. **Advanced Features**
   - Document sharing policies
   - Team notifications
   - Audit logging
   - Team-wide permissions

3. **Performance**
   - Query optimization
   - Caching strategy
   - Rate limiting per endpoint

4. **Security**
   - API rate limiting
   - CORS configuration
   - Authentication refresh

---

## Reference Documents

- **TEAMS_GUIDE.md** - Complete API reference
- **TEAM_IMPLEMENTATION_SUMMARY.md** - Implementation details
- **MIGRATION_GUIDE.md** - Database migration steps
- **PRODUCTION_READY.md** - Versioning production guide

---

## Ready to Build?

All foundation is in place. Just need to:

1. ✅ Run Prisma migration
2. ✅ Build 3 controllers
3. ✅ Write 1 service
4. ✅ Test thoroughly
5. ✅ Deploy

**Estimated time to production: 3.5 hours**

Start with: `npm run prisma:migrate:dev -- --name "add-teams-and-versioning"`

