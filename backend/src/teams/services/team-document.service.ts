import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { DocumentVersionService } from '../../documents/document-version.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PermissionService } from './permission.service.js';
import { CreateTeamDocumentDto } from '../dto/team-document.dto.js';

@Injectable()
export class TeamDocumentService {
  private logger = new Logger('TeamDocumentService');
  private readonly MAX_CONTENT_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_CHANGELOG_SIZE = 500;

  constructor(
    private prisma: PrismaService,
    private permissionService: PermissionService,
    private versionService: DocumentVersionService,
  ) { }

  /**
   * Create a new document in a team
   */
  async createTeamDocument(
    teamId: string,
    userId: string,
    dto: CreateTeamDocumentDto,
  ) {
    try {
      this.logger.debug(`Creating team document for team ${teamId} by user ${userId}`);

      // Validate user can create documents in this team (EDITOR or ADMIN)
      const hasEditRole = await this.permissionService.hasTeamRole(userId, teamId, 'ADMIN');
      if (!hasEditRole) {
        this.logger.warn(`User ${userId} denied edit access to team ${teamId}`);
        throw new ForbiddenException('You do not have permission to create documents in this team');
      }

      // Validate input
      this.validateDocumentInput(dto.title, dto.content, dto.changelog);

      // Check if team exists
      const team = await this.prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!team) {
        throw new NotFoundException('Team not found');
      }

      // Check if folder exists (if provided)
      if (dto.folderId) {
        const folder = await this.prisma.teamFolder.findUnique({
          where: { id: dto.folderId },
        });

        if (!folder || folder.teamId !== teamId) {
          throw new BadRequestException('Folder not found in this team');
        }
      }

      // Create document
      const document = await this.prisma.teamDocument.create({
        data: {
          teamId,
          title: dto.title,
          content: dto.content || '',
          folderId: dto.folderId || null,
          ownerId: userId,
          currentVersion: 1,
        },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(`Team document created: ${document.id} in team ${teamId}`);
      return this.formatDocumentResponse(document);
    } catch (error: any) {
      this.logger.error(`Failed to create team document: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a single team document
   */
  async getTeamDocument(teamId: string, documentId: string, userId: string) {
    try {
      this.logger.debug(`Getting team document ${documentId} from team ${teamId}`);

      // Check if team exists
      const team = await this.prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!team) {
        throw new NotFoundException('Team not found');
      }

      // Get document
      const document = await this.prisma.teamDocument.findUnique({
        where: { id: documentId },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!document) {
        throw new NotFoundException('Document not found');
      }

      if (document.teamId !== teamId) {
        throw new BadRequestException('Document does not belong to this team');
      }

      // Check access permission
      const canAccess = await this.permissionService.canAccessTeamDocument(userId, documentId);
      if (!canAccess) {
        this.logger.warn(`User ${userId} denied access to document ${documentId}`);
        throw new ForbiddenException('You do not have permission to access this document');
      }

      this.logger.log(`Team document ${documentId} retrieved for user ${userId}`);
      return this.formatDocumentResponse(document);
    } catch (error: any) {
      this.logger.error(`Failed to get team document: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * List documents in a team
   */
  async listTeamDocuments(teamId: string, userId: string, skip: number = 0, take: number = 20) {
    try {
      this.logger.debug(`Listing documents in team ${teamId}`);

      // Check team membership
      const isMember = await this.permissionService.canAccessTeam(userId, teamId);
      if (!isMember) {
        throw new ForbiddenException('You are not a member of this team');
      }

      // Get documents
      const documents = await this.prisma.teamDocument.findMany({
        where: { teamId },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log(`Retrieved ${documents.length} documents from team ${teamId}`);
      return documents.map((doc) => this.formatDocumentResponse(doc));
    } catch (error: any) {
      this.logger.error(`Failed to list team documents: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update a team document
   */
  async updateTeamDocument(
    teamId: string,
    documentId: string,
    userId: string,
    dto: {
      title?: string;
      content?: string;
      changelog?: string;
      folderId?: string;
    },
  ) {
    try {
      this.logger.debug(`Updating team document ${documentId} by user ${userId}`);

      // Get document
      const document = await this.prisma.teamDocument.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        throw new NotFoundException('Document not found');
      }

      if (document.teamId !== teamId) {
        throw new BadRequestException('Document does not belong to this team');
      }

      // Check edit permission
      const canEdit = await this.permissionService.canEditTeamDocument(userId, documentId);
      if (!canEdit) {
        this.logger.warn(`User ${userId} denied edit access to document ${documentId}`);
        throw new ForbiddenException('You do not have permission to edit this document');
      }

      // Validate input
      if (dto.title) {
        this.validateDocumentTitle(dto.title);
      }
      if (dto.content) {
        this.validateDocumentContent(dto.content);
      }
      if (dto.changelog) {
        this.validateChangelog(dto.changelog);
      }

      // If content is being updated, create a version first
      if (dto.content !== undefined && dto.content !== document.content) {
        await this.createTeamDocumentVersion(
          documentId,
          document.content ?? '',
          dto.changelog || 'Document updated',
          userId,
        );
      }

      // Check if folder is valid (if being updated)
      if (dto.folderId !== undefined && dto.folderId !== null) {
        const folder = await this.prisma.teamFolder.findUnique({
          where: { id: dto.folderId },
        });

        if (!folder || folder.teamId !== teamId) {
          throw new BadRequestException('Folder not found in this team');
        }
      }

      // Update document
      const updated = await this.prisma.teamDocument.update({
        where: { id: documentId },
        data: {
          title: dto.title || document.title,
          content: dto.content !== undefined ? dto.content : document.content,
          folderId: dto.folderId !== undefined ? dto.folderId : document.folderId,
          currentVersion:
            document.currentVersion +
            (dto.content !== undefined && dto.content !== document.content ? 1 : 0),
          updatedAt: new Date(),
        },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(`Team document ${documentId} updated successfully`);
      return this.formatDocumentResponse(updated);
    } catch (error: any) {
      this.logger.error(`Failed to update team document: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a team document
   */
  async deleteTeamDocument(teamId: string, documentId: string, userId: string) {
    try {
      this.logger.debug(`Deleting team document ${documentId} by user ${userId}`);

      // Get document
      const document = await this.prisma.teamDocument.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        throw new NotFoundException('Document not found');
      }

      if (document.teamId !== teamId) {
        throw new BadRequestException('Document does not belong to this team');
      }

      // Check delete permission
      const canDelete = await this.permissionService.canDeleteTeamDocument(userId, documentId);
      if (!canDelete) {
        this.logger.warn(`User ${userId} denied delete access to document ${documentId}`);
        throw new ForbiddenException('You do not have permission to delete this document');
      }

      // Delete document (cascades to versions)
      await this.prisma.teamDocument.delete({
        where: { id: documentId },
      });

      this.logger.log(`Team document ${documentId} deleted successfully`);
    } catch (error: any) {
      this.logger.error(`Failed to delete team document: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get document version history
   */
  async getDocumentVersions(
    teamId: string,
    documentId: string,
    userId: string,
    skip: number = 0,
    take: number = 20,
  ) {
    try {
      this.logger.debug(`Getting versions for document ${documentId}`);

      // Get document
      const document = await this.prisma.teamDocument.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        throw new NotFoundException('Document not found');
      }

      if (document.teamId !== teamId) {
        throw new BadRequestException('Document does not belong to this team');
      }

      // Check access permission
      const canAccess = await this.permissionService.canAccessTeamDocument(userId, documentId);
      if (!canAccess) {
        throw new ForbiddenException('You do not have permission to access this document');
      }

      // Get versions
      const versions = await this.prisma.teamDocumentVersion.findMany({
        where: { teamDocumentId: documentId },
        skip,
        take,
        orderBy: { versionNumber: 'desc' },
      });

      this.logger.log(`Retrieved ${versions.length} versions for document ${documentId}`);
      return versions;
    } catch (error: any) {
      this.logger.error(`Failed to get document versions: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a version for a team document
   */
  private async createTeamDocumentVersion(
    documentId: string,
    content: string,
    changelog: string,
    userId: string,
  ) {
    try {
      const latestVersion = await this.prisma.teamDocumentVersion.findMany({
        where: { teamDocumentId: documentId },
        orderBy: { versionNumber: 'desc' },
        take: 1,
      });

      const versionNumber = (latestVersion[0]?.versionNumber || 0) + 1;

      await this.prisma.teamDocumentVersion.create({
        data: {
          teamDocumentId: documentId,
          versionNumber,
          content,
          changelog,
          createdBy: userId,
        },
      });

      this.logger.debug(
        `Team document version ${versionNumber} created for document ${documentId}`,
      );
    } catch (error: any) {
      this.logger.error(`Failed to create team document version: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Validate document input
   */
  private validateDocumentInput(title: string, content?: string, changelog?: string) {
    this.validateDocumentTitle(title);
    if (content) {
      this.validateDocumentContent(content);
    }
    if (changelog) {
      this.validateChangelog(changelog);
    }
  }

  /**
   * Validate document title
   */
  private validateDocumentTitle(title: string) {
    if (!title || title.trim().length === 0) {
      throw new BadRequestException('Document title is required');
    }
    if (title.length > 255) {
      throw new BadRequestException('Document title must be less than 255 characters');
    }
  }

  /**
   * Validate document content
   */
  private validateDocumentContent(content: string) {
    if (Buffer.byteLength(content, 'utf8') > this.MAX_CONTENT_SIZE) {
      throw new BadRequestException(
        `Content size must not exceed ${this.MAX_CONTENT_SIZE / (1024 * 1024)}MB`,
      );
    }
  }

  /**
   * Validate changelog
   */
  private validateChangelog(changelog: string) {
    if (changelog.length > this.MAX_CHANGELOG_SIZE) {
      throw new BadRequestException(
        `Changelog must be less than ${this.MAX_CHANGELOG_SIZE} characters`,
      );
    }
  }

  /**
   * Format document response
   */
  private formatDocumentResponse(document: any) {
    return {
      id: document.id,
      teamId: document.teamId,
      folderId: document.folderId,
      title: document.title,
      content: document.content,
      currentVersion: document.currentVersion,
      owner: {
        id: document.owner.id,
        email: document.owner.email,
        name: document.owner.name,
      },
      team: {
        id: document.team.id,
        name: document.team.name,
      },
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
