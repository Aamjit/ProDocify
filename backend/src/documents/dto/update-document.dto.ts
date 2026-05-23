import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDocumentDto {
    @ApiProperty({ example: 'Updated Title', description: 'Document title', required: false })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({ example: '# Updated markdown content', description: 'Document content in Markdown', required: false })
    @IsOptional()
    @IsString()
    content?: string;

    @ApiProperty({ example: 'Updated section description', description: 'Description of changes', required: false })
    @IsOptional()
    @IsString()
    changelog?: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Folder ID (UUID)', required: false })
    @IsOptional()
    @IsUUID()
    folderId?: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Document owner ID (UUID)', required: false })
    @IsOptional()
    @IsUUID()
    ownerId?: string;
}
