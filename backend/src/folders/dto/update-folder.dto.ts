import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFolderDto {
    @ApiProperty({ example: 'Updated Folder Name', description: 'Folder name', required: false })
    @IsOptional()
    @IsString()
    name?: string;
}
