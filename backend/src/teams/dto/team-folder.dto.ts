import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamFolderDto {
    @ApiProperty({ example: 'Sprint Notes', description: 'Folder name' })
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    name!: string;
}

export class UpdateTeamFolderDto {
    @ApiProperty({ example: 'Updated Folder Name', description: 'New folder name' })
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    name!: string;
}
