import { Module } from '@nestjs/common';
import { UserContextService } from '../common/user-context.service.js';
import { DocumentVersionService } from '../documents/document-version.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { TeamDocumentController } from './controllers/team-document.controller.js';
import { TeamController } from './controllers/team.controller.js';
import { RoleGuard } from './guards/role.guard.js';
import { PermissionService } from './services/permission.service.js';
import { TeamDocumentService } from './services/team-document.service.js';
import { TeamMemberService } from './services/team-member.service.js';
import { TeamService } from './services/team.service.js';
import { TeamFolderService } from './services/team-folder.service.js';
import { TeamFolderController } from './controllers/team-folder.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [TeamController, TeamDocumentController, TeamFolderController],
  providers: [
    TeamService,
    TeamMemberService,
    TeamDocumentService,
    PermissionService,
    RoleGuard,
    TeamFolderService,
    DocumentVersionService,
    UserContextService,
  ],
  exports: [TeamService, TeamMemberService, TeamDocumentService, PermissionService, RoleGuard],
})
export class TeamsModule { }
