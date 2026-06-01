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

@ApiTags('Team Documents')
@ApiBearerAuth()
@Controller('teams/:teamId/documents')
@UseGuards(JwtAuthGuard)
export class TeamDocumentController {
  private logger = new Logger('TeamDocumentController');

  constructor(
    private documentService: TeamDocumentService,
    private permissionService: PermissionService,
  ) { }

  /**
   * Create a new document in a team
   * POST /teams/:teamId/documents
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RoleGuard)
  @ApiOperation({ summary: 'Create document in team (EDITOR or ADMIN)' })
  @ApiResponse({
    status: 201,
    description: 'Document created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async createDocument(
    @Param('teamId') teamId: string,
    @Body() dto: { title: string; content?: string; folderId?: string },
    @Req() req: any,
  ): Promise<any> {
    try {
      this.logger.log(`User ${req.user.id} creating document in team ${teamId}`);

      const document = await this.documentService.createTeamDocument(teamId, req.user.id, dto);
      return document;
    } catch (error: any) {
      this.logger.error(`Failed to create document: ${error.message}`);
      throw error;
    }
  }

  /**
   * List documents in a team
   * GET /teams/:teamId/documents
   */
  @Get()
  @UseGuards(RoleGuard)
  @ApiOperation({ summary: 'List documents in team' })
  @ApiResponse({
    status: 200,
    description: 'Documents retrieved successfully',
    isArray: true,
  })
  @ApiResponse({
    status: 403,
    description: 'Not a member of this team',
  })
  async listDocuments(
    @Param('teamId') teamId: string,
    @Req() req: any,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ): Promise<any> {
    try {
      this.logger.log(`User ${req.user.id} listing documents in team ${teamId}`);

      // Validate pagination
      const safeSkip = Math.max(0, parseInt(String(skip)) || 0);
      const safeTake = Math.min(100, Math.max(1, parseInt(String(take)) || 20));

      const documents = await this.documentService.listTeamDocuments(
        teamId,
        req.user.id,
        safeSkip,
        safeTake,
      );
      return documents;
    } catch (error: any) {
      this.logger.error(`Failed to list documents: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a specific document
   * GET /teams/:teamId/documents/:docId
   */
  @Get(':docId')
  @UseGuards(RoleGuard)
  @ApiOperation({ summary: 'Get document from team' })
  @ApiResponse({
    status: 200,
    description: 'Document retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async getDocument(
    @Param('teamId') teamId: string,
    @Param('docId') docId: string,
    @Req() req: any,
  ): Promise<any> {
    try {
      this.logger.log(`User ${req.user.id} getting document ${docId} from team ${teamId}`);

      const document = await this.documentService.getTeamDocument(teamId, docId, req.user.id);
      return document;
    } catch (error: any) {
      this.logger.error(`Failed to get document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a document
   * PUT /teams/:teamId/documents/:docId
   */
  @Put(':docId')
  @UseGuards(RoleGuard)
  @ApiOperation({ summary: 'Update document (EDITOR or ADMIN)' })
  @ApiResponse({
    status: 200,
    description: 'Document updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async updateDocument(
    @Param('teamId') teamId: string,
    @Param('docId') docId: string,
    @Body() dto: { title?: string; content?: string; changelog?: string; folderId?: string },
    @Req() req: any,
  ): Promise<any> {
    try {
      this.logger.log(`User ${req.user.id} updating document ${docId} in team ${teamId}`);

      const document = await this.documentService.updateTeamDocument(
        teamId,
        docId,
        req.user.id,
        dto,
      );
      return document;
    } catch (error: any) {
      this.logger.error(`Failed to update document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a document
   * DELETE /teams/:teamId/documents/:docId
   */
  @Delete(':docId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RoleGuard)
  @ApiOperation({ summary: 'Delete document (EDITOR or ADMIN)' })
  @ApiResponse({
    status: 204,
    description: 'Document deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async deleteDocument(
    @Param('teamId') teamId: string,
    @Param('docId') docId: string,
    @Req() req: any,
  ): Promise<void> {
    try {
      this.logger.log(`User ${req.user.id} deleting document ${docId} from team ${teamId}`);

      await this.documentService.deleteTeamDocument(teamId, docId, req.user.id);
    } catch (error: any) {
      this.logger.error(`Failed to delete document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get document version history
   * GET /teams/:teamId/documents/:docId/versions
   */
  @Get(':docId/versions')
  @UseGuards(RoleGuard)
  @ApiOperation({ summary: 'Get document version history' })
  @ApiResponse({
    status: 200,
    description: 'Version history retrieved successfully',
    isArray: true,
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async getVersions(
    @Param('teamId') teamId: string,
    @Param('docId') docId: string,
    @Req() req: any,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ): Promise<any> {
    try {
      this.logger.log(
        `User ${req.user.id} getting versions for document ${docId} in team ${teamId}`,
      );

      // Validate pagination
      const safeSkip = Math.max(0, parseInt(String(skip)) || 0);
      const safeTake = Math.min(100, Math.max(1, parseInt(String(take)) || 20));

      const versions = await this.documentService.getDocumentVersions(
        teamId,
        docId,
        req.user.id,
        safeSkip,
        safeTake,
      );
      return versions;
    } catch (error: any) {
      this.logger.error(`Failed to get versions: ${error.message}`);
      throw error;
    }
  }
}
