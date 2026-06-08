import { IsString, IsOptional, IsEmail, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Team DTOs
 */

export class CreateTeamDto {
  @ApiProperty({ example: 'My Team', description: 'Team name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'Optional description of the team', description: 'Team description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateTeamDto {
  @ApiProperty({ example: 'Renamed Team', description: 'Updated team name', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ example: 'Updated description', description: 'Updated team description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class AddTeamMemberDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email address of the member to add' })
  @IsString()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'VIEWER', description: 'Role to assign to the member', enum: ['ADMIN', 'EDITOR', 'VIEWER'], required: false })
  @IsEnum(['ADMIN', 'EDITOR', 'VIEWER'])
  role: string = 'VIEWER';
}

export class UpdateTeamMemberDto {
  @ApiProperty({ example: 'EDITOR', description: 'New role for the team member', enum: ['ADMIN', 'EDITOR', 'VIEWER'] })
  @IsEnum(['ADMIN', 'EDITOR', 'VIEWER'])
  role!: string;
}

export class TeamMemberResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'Full Name', required: false })
  name?: string;

  @ApiProperty({ example: 'VIEWER' })
  role!: string;

  @ApiProperty({ example: '2026-06-01T12:00:00.000Z' })
  joinedAt!: Date;
}

export class TeamResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'My Team' })
  name!: string;

  @ApiProperty({ example: 'Optional description', required: false })
  description?: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  ownerId!: string;

  @ApiProperty({ type: [TeamMemberResponseDto], required: false })
  members?: TeamMemberResponseDto[];

  @ApiProperty({ example: 3, required: false })
  memberCount?: number;

  @ApiProperty({ example: 12, required: false })
  documentCount?: number;

  @ApiProperty({ example: '2026-06-01T12:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-06-02T12:00:00.000Z' })
  updatedAt!: Date;
}

export class TeamListResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'My Team' })
  name!: string;

  @ApiProperty({ example: 'Optional description', required: false })
  description?: string;

  @ApiProperty({ example: 'EDITOR' })
  role!: string;

  @ApiProperty({ example: 5 })
  memberCount!: number;

  @ApiProperty({ example: 20 })
  documentCount!: number;

  @ApiProperty({ example: '2026-06-01T12:00:00.000Z' })
  createdAt!: Date;
}
