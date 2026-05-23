import { IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RollbackDto {
  @ApiProperty({ example: 1, description: 'Version number to rollback to' })
  @IsNotEmpty()
  @IsInt()
  versionNumber!: number;
}
