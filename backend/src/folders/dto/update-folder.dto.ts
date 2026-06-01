import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateFolderDto {
  @ApiProperty({ example: 'Updated Folder Name', description: 'Folder name', required: false })
  @IsOptional()
  @IsString()
  name?: string;
}
