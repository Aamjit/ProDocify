import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PermissionService } from './permission.service.js';
import { TeamDocumentService } from './team-document.service.js';
import { CreateTeamFolderDto, UpdateTeamFolderDto } from '../dto/team-folder.dto.js';

@Injectable()
export class TeamFolderService {
    private readonly logger = new Logger(TeamFolderService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly permissionService: PermissionService,
        private readonly documentService: TeamDocumentService,
    ) { }

    async createTeamFolder(teamId: string, userId: string, dto: CreateTeamFolderDto) {
        try {
            // Only owner or admin can create folders
            const canManage = await this.permissionService.canManageTeam(userId, teamId);
            if (!canManage) {
                throw new ForbiddenException('You do not have permission to create folders in this team');
            }

            if (!dto.name || dto.name.trim().length === 0) {
                throw new BadRequestException('Folder name is required');
            }

            const folder = await this.prisma.teamFolder.create({
                data: {
                    teamId,
                    name: dto.name.trim(),
                    createdBy: userId,
                },
            });

            this.logger.log(`Folder ${folder.id} created in team ${teamId} by ${userId}`);
            return folder;
        } catch (error: any) {
            this.logger.error(`Failed to create team folder: ${error.message}`, error.stack);
            throw error;
        }
    }

    async updateTeamFolder(teamId: string, folderId: string, userId: string, dto: UpdateTeamFolderDto) {
        try {
            const canManage = await this.permissionService.canManageTeam(userId, teamId);
            if (!canManage) {
                throw new ForbiddenException('You do not have permission to update folders in this team');
            }

            const folder = await this.prisma.teamFolder.findUnique({ where: { id: folderId } });
            if (!folder || folder.teamId !== teamId) {
                throw new NotFoundException('Folder not found');
            }

            const updated = await this.prisma.teamFolder.update({
                where: { id: folderId },
                data: { name: dto.name.trim(), updatedAt: new Date() },
            });

            this.logger.log(`Folder ${folderId} updated in team ${teamId} by ${userId}`);
            return updated;
        } catch (error: any) {
            this.logger.error(`Failed to update team folder: ${error.message}`, error.stack);
            throw error;
        }
    }

    async deleteTeamFolder(teamId: string, folderId: string, userId: string) {
        try {
            const canManage = await this.permissionService.canManageTeam(userId, teamId);
            if (!canManage) {
                throw new ForbiddenException('You do not have permission to delete folders in this team');
            }

            const folder = await this.prisma.teamFolder.findUnique({ where: { id: folderId } });
            if (!folder || folder.teamId !== teamId) {
                throw new NotFoundException('Folder not found');
            }

            // Unlink documents from this folder (preserve documents)
            await this.prisma.teamDocument.updateMany({ where: { folderId }, data: { folderId: null } });

            await this.prisma.teamFolder.delete({ where: { id: folderId } });
            this.logger.log(`Folder ${folderId} deleted from team ${teamId} by ${userId}`);
        } catch (error: any) {
            this.logger.error(`Failed to delete team folder: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Assign an existing document to a folder (requires edit permission)
     */
    async assignDocumentToFolder(teamId: string, folderId: string, userId: string, documentId: string) {
        try {
            const folder = await this.prisma.teamFolder.findUnique({ where: { id: folderId } });
            if (!folder || folder.teamId !== teamId) {
                throw new NotFoundException('Folder not found in this team');
            }

            // Validate document exists and belongs to team
            const document = await this.prisma.teamDocument.findUnique({ where: { id: documentId } });
            if (!document) throw new NotFoundException('Document not found');
            if (document.teamId !== teamId) throw new BadRequestException('Document does not belong to this team');

            // Check edit permission
            const canEdit = await this.permissionService.canEditTeamDocument(userId, documentId);
            if (!canEdit) {
                throw new ForbiddenException('You do not have permission to move this document');
            }

            const updated = await this.prisma.teamDocument.update({ where: { id: documentId }, data: { folderId } });
            this.logger.log(`Document ${documentId} assigned to folder ${folderId} by ${userId}`);
            return updated;
        } catch (error: any) {
            this.logger.error(`Failed to assign document to folder: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Create a new document in a folder by delegating to TeamDocumentService
     */
    async createDocumentInFolder(teamId: string, folderId: string, userId: string, dto: any) {
        // ensure folder exists and belongs to team
        const folder = await this.prisma.teamFolder.findUnique({ where: { id: folderId } });
        if (!folder || folder.teamId !== teamId) {
            throw new NotFoundException('Folder not found in this team');
        }
        // delegate to TeamDocumentService with folderId
        return this.documentService.createTeamDocument(teamId, userId, { ...dto, folderId });
    }
}
