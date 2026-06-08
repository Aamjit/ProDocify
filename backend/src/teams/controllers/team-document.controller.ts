import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RoleGuard } from '../guards/role.guard.js';
import { PermissionService } from '../services/permission.service.js';
import { TeamDocumentService } from '../services/team-document.service.js';
import { CreateTeamDocumentDto } from '../dto/team-document.dto.js';
import * as swaggerDecorators from './swagger.decorators.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { UserContextService } from '../../common/user-context.service.js';
import { winstonLogger } from '../../common/logger.js';

@ApiTags('Team Documents')
@ApiBearerAuth('JWT-auth')
@Controller('teams/:teamId/documents')
@UseGuards(JwtAuthGuard)
export class TeamDocumentController {

  constructor(
    private documentService: TeamDocumentService,
    private permissionService: PermissionService,
    private userContext: UserContextService,
  ) { }

  /**
   * Create a new document in a team
   * POST /teams/:teamId/documents
   */
  @Post()
  @swaggerDecorators.ApiCreateTeamDocumentSwaggerDecorator()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RoleGuard)
  async createDocument(
    @Param('teamId') teamId: string,
    @Body() dto: CreateTeamDocumentDto,
  ): Promise<any> {
    winstonLogger.log(`Creating document in team ${teamId} with title "${dto.title}"`);
    const userId = this.userContext.getCurrentUserId();
    try {
      const document = await this.documentService.createTeamDocument(teamId, userId, dto);
      return document;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * List documents in a team
   * GET /teams/:teamId/documents
   */
  @Get()
  @swaggerDecorators.ApiListTeamDocumentsSwaggerDecorator()
  @UseGuards(RoleGuard)
  async listDocuments(
    @Param('teamId') teamId: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ): Promise<any> {
    try {
      const userId = this.userContext.getCurrentUserId();

      // Validate pagination
      const safeSkip = Math.max(0, parseInt(String(skip)) || 0);
      const safeTake = Math.min(100, Math.max(1, parseInt(String(take)) || 20));

      const documents = await this.documentService.listTeamDocuments(
        teamId,
        userId,
        safeSkip,
        safeTake,
      );
      return documents;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get a specific document
   * GET /teams/:teamId/documents/:docId
   */
  @Get(':docId')
  @swaggerDecorators.ApiGetTeamDocumentSwaggerDecorator()
  @UseGuards(RoleGuard)
  async getDocument(
    @Param('teamId') teamId: string,
    @Param('docId') docId: string,
  ): Promise<any> {
    try {

      const userId = this.userContext.getCurrentUserId();
      const document = await this.documentService.getTeamDocument(teamId, docId, userId);
      return document;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Update a document
   * PUT /teams/:teamId/documents/:docId
   */
  @Put(':docId')
  @swaggerDecorators.ApiUpdateTeamDocumentSwaggerDecorator()
  @UseGuards(RoleGuard)
  async updateDocument(
    @Param('teamId') teamId: string,
    @Param('docId') docId: string,
    @Body() dto: { title?: string; content?: string; changelog?: string; folderId?: string },
  ): Promise<any> {
    try {
      const userId = this.userContext.getCurrentUserId();

      const document = await this.documentService.updateTeamDocument(
        teamId,
        docId,
        userId,
        dto,
      );
      return document;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Delete a document
   * DELETE /teams/:teamId/documents/:docId
   */
  @Delete(':docId')
  @swaggerDecorators.ApiDeleteTeamDocumentSwaggerDecorator()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RoleGuard)
  async deleteDocument(
    @Param('teamId') teamId: string,
    @Param('docId') docId: string,
  ): Promise<void> {
    try {
      const userId = this.userContext.getCurrentUserId();

      await this.documentService.deleteTeamDocument(teamId, docId, userId);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get document version history
   * GET /teams/:teamId/documents/:docId/versions
   */
  @Get(':docId/versions')
  @swaggerDecorators.ApiListTeamDocumentVersionsSwaggerDecorator()
  @UseGuards(RoleGuard)
  async getVersions(
    @Param('teamId') teamId: string,
    @Param('docId') docId: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ): Promise<any> {
    try {
      const userId = this.userContext.getCurrentUserId();

      // Validate pagination
      const safeSkip = Math.max(0, parseInt(String(skip)) || 0);
      const safeTake = Math.min(100, Math.max(1, parseInt(String(take)) || 20));

      const versions = await this.documentService.getDocumentVersions(
        teamId,
        docId,
        userId,
        safeSkip,
        safeTake,
      );
      return versions;
    } catch (error: any) {
      throw error;
    }
  }
}
