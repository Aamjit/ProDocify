import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Query } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentVersionService } from './document-version.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { CreateVersionDto } from './dto/create-version.dto';
import { RollbackDto } from './dto/rollback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('documents')
@ApiBearerAuth('JWT-auth')
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
    constructor(
        private readonly documentsService: DocumentsService,
        private readonly versionService: DocumentVersionService
    ) { }

    @Get()
    @ApiOperation({ summary: 'List all documents for the current user' })
    @ApiResponse({ status: 200, description: 'Array of documents', type: CreateDocumentDto, isArray: true })
    findAll(@CurrentUser() user: any) {
        return this.documentsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single document by ID' })
    @ApiResponse({ status: 200, description: 'Document found', type: CreateDocumentDto })
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.documentsService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new document' })
    @ApiBody({ type: CreateDocumentDto })
    @ApiResponse({ status: 201, description: 'Document created', type: CreateDocumentDto })
    create(@Body() createDocumentDto: CreateDocumentDto, @CurrentUser() user: any) {
        return this.documentsService.create(createDocumentDto, user.id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a document by ID' })
    @ApiBody({ type: UpdateDocumentDto })
    @ApiResponse({ status: 200, description: 'Document updated', type: CreateDocumentDto })
    update(
        @Param('id') id: string,
        @Body() updateDocumentDto: UpdateDocumentDto,
        @CurrentUser() user: any
    ) {
        return this.documentsService.update(id, updateDocumentDto, user.id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a document by ID' })
    @ApiResponse({ status: 200, description: 'Document deleted' })
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.documentsService.remove(id);
    }

    // Version endpoints
    @Get(':id/versions')
    @ApiOperation({ summary: 'Get version history for a document' })
    @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Number of versions to skip' })
    @ApiQuery({ name: 'take', required: false, type: Number, description: 'Number of versions to fetch' })
    @ApiResponse({ status: 200, description: 'Version history with pagination' })
    getVersionHistory(
        @Param('id') id: string,
        @Query('skip') skip?: string,
        @Query('take') take?: string,
        @CurrentUser() user?: any
    ) {
        return this.versionService.getVersionHistory(id, user.id, parseInt(skip || '0'), parseInt(take || '20'));
    }

    @Get(':id/versions/:versionNumber')
    @ApiOperation({ summary: 'Get a specific version of a document' })
    @ApiResponse({ status: 200, description: 'Specific version found' })
    getVersion(
        @Param('id') id: string,
        @Param('versionNumber') versionNumber: string,
        @CurrentUser() user?: any
    ) {
        return this.versionService.getVersion(id, parseInt(versionNumber), user.id);
    }

    @Post(':id/versions')
    @ApiOperation({ summary: 'Create a new version (typically called on save)' })
    @ApiBody({ type: CreateVersionDto })
    @ApiResponse({ status: 201, description: 'Version created' })
    createVersion(
        @Param('id') id: string,
        @Body() createVersionDto: CreateVersionDto,
        @CurrentUser() user?: any
    ) {
        return this.versionService.createVersion(id, user.id, createVersionDto);
    }

    @Post(':id/versions/:versionNumber/rollback')
    @ApiOperation({ summary: 'Rollback document to a specific version' })
    @ApiResponse({ status: 200, description: 'Document rolled back successfully' })
    rollbackToVersion(
        @Param('id') id: string,
        @Param('versionNumber') versionNumber: string,
        @CurrentUser() user?: any
    ) {
        return this.versionService.rollbackToVersion(id, parseInt(versionNumber), user.id);
    }

    @Get(':id/versions/compare')
    @ApiOperation({ summary: 'Compare two versions of a document' })
    @ApiQuery({ name: 'version1', required: true, type: Number, description: 'First version number' })
    @ApiQuery({ name: 'version2', required: true, type: Number, description: 'Second version number' })
    @ApiResponse({ status: 200, description: 'Version comparison' })
    compareVersions(
        @Param('id') id: string,
        @Query('version1') version1: string,
        @Query('version2') version2: string,
        @CurrentUser() user?: any
    ) {
        return this.versionService.compareVersions(id, parseInt(version1), parseInt(version2), user.id);
    }
}
