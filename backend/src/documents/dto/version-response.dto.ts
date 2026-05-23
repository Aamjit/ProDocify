import { IsNotEmpty, IsString, IsInt, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VersionResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Version ID' })
  id!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Document ID' })
  documentId!: string;

  @ApiProperty({ example: 1, description: 'Version number' })
  versionNumber!: number;

  @ApiProperty({ example: 'Initial document creation', description: 'Change description', required: false })
  changelog?: string;

  @ApiProperty({ example: '# Document Title\n\nContent here', description: 'Document content at this version' })
  content!: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z', description: 'When version was created' })
  createdAt!: Date;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'User ID who created this version' })
  createdBy!: string;

  @ApiProperty({ description: 'User who created this version' })
  creator?: any;
}
