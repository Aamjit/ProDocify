import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('folders')
@ApiBearerAuth('JWT-auth')
@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FoldersController {
    constructor(private readonly foldersService: FoldersService) { }

    @Get()
    @ApiOperation({ summary: 'List all folders for the current user' })
    @ApiResponse({ status: 200, description: 'Array of folders', type: CreateFolderDto, isArray: true })
    findAll(@CurrentUser() user: any) {
        return this.foldersService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single folder by ID' })
    @ApiResponse({ status: 200, description: 'Folder found', type: CreateFolderDto })
    findOne(@Param('id') id: string, @CurrentUser() user: any) {
        return this.foldersService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new folder' })
    @ApiBody({ type: CreateFolderDto })
    @ApiResponse({ status: 201, description: 'Folder created', type: CreateFolderDto })
    create(@Body() createFolderDto: CreateFolderDto, @CurrentUser() user: any) {
        return this.foldersService.create(createFolderDto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a folder by ID' })
    @ApiBody({ type: UpdateFolderDto })
    @ApiResponse({ status: 200, description: 'Folder updated', type: CreateFolderDto })
    update(
        @Param('id') id: string,
        @Body() updateFolderDto: UpdateFolderDto,
        @CurrentUser() user: any
    ) {
        return this.foldersService.update(id, updateFolderDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a folder by ID' })
    @ApiResponse({ status: 200, description: 'Folder deleted' })
    remove(@Param('id') id: string, @CurrentUser() user: any) {
        return this.foldersService.remove(id);
    }
}
