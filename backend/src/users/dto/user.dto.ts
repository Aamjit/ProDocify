import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserDto {
  @ApiProperty({ description: 'User ID (UUID)' })
  id!: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  email!: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name', required: false })
  name?: string;

  @Exclude()
  password!: string;

  @ApiProperty({ description: 'User creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'User last update timestamp' })
  updatedAt!: Date;
}
