import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFolderDto {
  @ApiProperty({ example: 'My Documents', description: 'Folder name' })
  @IsNotEmpty()
  @IsString()
  name!: string;
}
