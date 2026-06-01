import { ApiProperty } from '@nestjs/swagger';

export class AuthenticatedUserDto {
  @ApiProperty({ description: 'User ID (UUID)' })
  id!: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  email!: string;
}
