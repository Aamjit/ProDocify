import {
    Controller,
    Post,
    Body,
    Param,
    UseGuards,
    Req,
    Put,
    Delete,
    Get,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { TeamFolderService } from '../services/team-folder.service.js';
import { CreateTeamFolderDto, UpdateTeamFolderDto } from '../dto/team-folder.dto.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('teams/:teamId/folders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('Teams Folders')
export class TeamFolderController {
    constructor(private readonly folderService: TeamFolderService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createFolder(@Param('teamId') teamId: string, @Req() req: any, @Body() dto: CreateTeamFolderDto) {
        const userId = req.user.id;
        return this.folderService.createTeamFolder(teamId, userId, dto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async listFolders(@Param('teamId') teamId: string) {
        return this.folderService['prisma'].teamFolder.findMany({ where: { teamId } });
    }

    @Put(':folderId')
    async updateFolder(
        @Param('teamId') teamId: string,
        @Param('folderId') folderId: string,
        @Req() req: any,
        @Body() dto: UpdateTeamFolderDto,
    ) {
        const userId = req.user.id;
        return this.folderService.updateTeamFolder(teamId, folderId, userId, dto);
    }

    @Delete(':folderId')
    async deleteFolder(@Param('teamId') teamId: string, @Param('folderId') folderId: string, @Req() req: any) {
        const userId = req.user.id;
        return this.folderService.deleteTeamFolder(teamId, folderId, userId);
    }

    @Post(':folderId/documents/:documentId/assign')
    async assignDocument(
        @Param('teamId') teamId: string,
        @Param('folderId') folderId: string,
        @Param('documentId') documentId: string,
        @Req() req: any,
    ) {
        const userId = req.user.id;
        return this.folderService.assignDocumentToFolder(teamId, folderId, userId, documentId);
    }

    @Post(':folderId/documents')
    async createDocumentInFolder(
        @Param('teamId') teamId: string,
        @Param('folderId') folderId: string,
        @Req() req: any,
        @Body() dto: any,
    ) {
        const userId = req.user.id;
        return this.folderService.createDocumentInFolder(teamId, folderId, userId, dto);
    }
}
