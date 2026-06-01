import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({ example: 'My Document Title', description: 'Document title' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({
    example: '# Markdown content here',
    description: 'Document content in Markdown',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Folder ID (UUID)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Document owner ID (UUID)',
  })
  @IsNotEmpty()
  @IsUUID()
  ownerId!: string;
}
