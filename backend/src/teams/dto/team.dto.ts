import { IsString, IsOptional, IsEmail, IsEnum, MinLength, MaxLength } from 'class-validator';

/**
 * Team DTOs
 */

export class CreateTeamDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class AddTeamMemberDto {
  @IsString()
  @IsEmail()
  email!: string;

  @IsEnum(['ADMIN', 'EDITOR', 'VIEWER'])
  role: string = 'VIEWER';
}

export class UpdateTeamMemberDto {
  @IsEnum(['ADMIN', 'EDITOR', 'VIEWER'])
  role!: string;
}

export class TeamMemberResponseDto {
  id!: string;
  userId!: string;
  email!: string;
  name?: string;
  role!: string;
  joinedAt!: Date;
}

export class TeamResponseDto {
  id!: string;
  name!: string;
  description?: string;
  ownerId!: string;
  members?: TeamMemberResponseDto[];
  memberCount?: number;
  documentCount?: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export class TeamListResponseDto {
  id!: string;
  name!: string;
  description?: string;
  role!: string;
  memberCount!: number;
  documentCount!: number;
  createdAt!: Date;
}
