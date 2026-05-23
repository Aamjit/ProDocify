import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFolderDto {
    @ApiProperty({ example: 'My Documents', description: 'Folder name' })
    @IsNotEmpty()
    @IsString()
    name!: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Folder owner ID (UUID)' })
    @IsNotEmpty()
    @IsUUID()
    ownerId!: string;
}
