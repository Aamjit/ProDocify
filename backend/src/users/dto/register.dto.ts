import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'password123', description: 'User password (minimum 6 characters, required for EMAIL auth)', required: false })
  @ValidateIf((o) => !o.accountAuthType || o.accountAuthType === 'EMAIL')
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'User avatar URL', required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ example: 'EMAIL', description: 'Authentication type: EMAIL or GOOGLE_OAUTH', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['EMAIL', 'GOOGLE_OAUTH'], { message: 'accountAuthType must be either EMAIL or GOOGLE_OAUTH' })
  accountAuthType?: string;
}
