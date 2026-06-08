import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Request DTO for creating a team document.
 * References the TeamDocument Prisma model fields: title, content, folderId.
 */
export class CreateTeamDocumentDto {
    @ApiProperty({
        example: 'Project Plan',
        description: 'Title of the team document as defined in the TeamDocument schema',
    })
    @IsString()
    @MaxLength(255)
    title!: string;

    @ApiProperty({
        example: 'This is the initial document content.',
        description: 'Optional document content stored in TeamDocument.content',
        required: false,
    })
    @IsOptional()
    @IsString()
    content?: string;

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'Optional team folder ID, matching TeamDocument.folderId',
        required: false,
    })
    @IsOptional()
    @IsString()
    folderId?: string;

    @ApiProperty({
        example: 'Initial content for the document',
        description: 'Optional changelog for the initial document version',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    changelog?: string;
}