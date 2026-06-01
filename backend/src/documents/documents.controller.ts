import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { AuthenticatedUserDto } from '../users/dto/authenticated-user.dto.js';
import { DocumentVersionService } from './document-version.service.js';
import { DocumentsService } from './documents.service.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { CreateVersionDto } from './dto/create-version.dto.js';
// import { RollbackDto } from './dto/rollback.dto';
import { UpdateDocumentDto } from './dto/update-document.dto.js';

@ApiTags('documents')
@ApiBearerAuth('JWT-auth')
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly versionService: DocumentVersionService,
  ) { }

  @Get()
  @ApiOperation({ summary: 'List all documents for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Array of documents',
    type: CreateDocumentDto,
    isArray: true,
  })
  async findAll(@CurrentUser() currentUser: AuthenticatedUserDto): Promise<any> {
    return this.documentsService.findAll(currentUser.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single document by ID' })
  @ApiResponse({ status: 200, description: 'Document found', type: CreateDocumentDto })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUserDto,
  ): Promise<any> {
    return this.documentsService.findOne(currentUser.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new document' })
  @ApiBody({ type: CreateDocumentDto })
  @ApiResponse({ status: 201, description: 'Document created', type: CreateDocumentDto })
  async create(
    @Body() createDocumentDto: CreateDocumentDto,
    @CurrentUser() currentUser: AuthenticatedUserDto,
  ): Promise<any> {
    return this.documentsService.create({ ...createDocumentDto, ownerId: currentUser.id });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a document by ID' })
  @ApiBody({ type: UpdateDocumentDto })
  @ApiResponse({ status: 200, description: 'Document updated', type: CreateDocumentDto })
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @CurrentUser() currentUser: AuthenticatedUserDto,
  ): Promise<any> {
    return this.documentsService.update(currentUser.id, id, updateDocumentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document by ID' })
  @ApiResponse({ status: 200, description: 'Document deleted' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUserDto,
  ): Promise<any> {
    return this.documentsService.remove(currentUser.id, id);
  }

  // Version endpoints
  @Get(':id/versions')
  @ApiOperation({ summary: 'Get version history for a document' })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of versions to skip',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of versions to fetch',
  })
  @ApiResponse({ status: 200, description: 'Version history with pagination' })
  getVersionHistory(
    @CurrentUser() currentUser: AuthenticatedUserDto,
    @Param('id') id: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<any> {
    return this.versionService.getVersionHistory(
      id,
      skip || 0,
      take || 20,
      currentUser.id,
    );
  }

  @Get(':id/versions/:versionNumber')
  @ApiOperation({ summary: 'Get a specific version of a document' })
  @ApiResponse({ status: 200, description: 'Specific version found' })
  getVersion(
    @Param('id') id: string,
    @Param('versionNumber') versionNumber: string,
    @CurrentUser() currentUser: AuthenticatedUserDto,
  ): Promise<any> {
    return this.versionService.getVersion(id, parseInt(versionNumber), currentUser.id);
  }

  @Post(':id/versions')
  @ApiOperation({ summary: 'Create a new version (typically called on save)' })
  @ApiBody({ type: CreateVersionDto })
  @ApiResponse({ status: 201, description: 'Version created' })
  createVersion(
    @Param('id') id: string,
    @Body() createVersionDto: CreateVersionDto,
    @CurrentUser() currentUser: AuthenticatedUserDto,
  ): Promise<any> {
    return this.versionService.createVersion(id, createVersionDto, currentUser.id);
  }

  @Post(':id/versions/:versionNumber/rollback')
  @ApiOperation({ summary: 'Rollback document to a specific version' })
  @ApiResponse({ status: 200, description: 'Document rolled back successfully' })
  rollbackToVersion(
    @Param('id') id: string,
    @Param('versionNumber') versionNumber: string,
    @CurrentUser() currentUser: AuthenticatedUserDto,
  ): Promise<any> {
    return this.versionService.rollbackToVersion(id, parseInt(versionNumber), currentUser.id);
  }

  @Get(':id/versions/compare')
  @ApiOperation({ summary: 'Compare two versions of a document' })
  @ApiQuery({ name: 'version1', required: true, type: Number, description: 'First version number' })
  @ApiQuery({
    name: 'version2',
    required: true,
    type: Number,
    description: 'Second version number',
  })
  @ApiResponse({ status: 200, description: 'Version comparison' })
  compareVersions(
    @Param('id') id: string,
    @Query('version1') version1: string,
    @Query('version2') version2: string,
    @CurrentUser() currentUser: AuthenticatedUserDto,
  ): Promise<any> {
    return this.versionService.compareVersions(
      id,
      parseInt(version1),
      parseInt(version2),
      currentUser.id,
    );
  }
}
