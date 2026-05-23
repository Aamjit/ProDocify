import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVersionDto {
  @ApiProperty({ example: 'Updated introduction section', description: 'Description of changes made', required: false })
  @IsOptional()
  @IsString()
  changelog?: string;

  @ApiProperty({ example: 'Updated content here', description: 'Document content being saved' })
  @IsNotEmpty()
  @IsString()
  content!: string | '';
}
