import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { UserContextService } from '../../common/user-context.service.js';
import {
  CreateTeamDto,
  UpdateTeamDto,
  AddTeamMemberDto,
  UpdateTeamMemberDto,
  TeamResponseDto,
  TeamMemberResponseDto,
} from '../dto/team.dto.js';
import { RoleGuard } from '../guards/role.guard.js';
import { PermissionService } from '../services/permission.service.js';
import { TeamMemberService } from '../services/team-member.service.js';
import { TeamService } from '../services/team.service.js';
import { AuthenticatedUserDto } from '../../users/dto/authenticated-user.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { winstonLogger } from '../../common/logger.js';
import * as swaggerDecorators from './swagger.decorators.js';

@Controller('teams')
@ApiTags('Teams')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(
    private teamService: TeamService,
    private memberService: TeamMemberService,
    private permissionService: PermissionService,
    private userContext: UserContextService,
  ) { }

  /**
   * Create a new team
   * POST /teams
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @swaggerDecorators.ApiCreateTeamSwaggerDecorator()
  @ApiBody({ type: CreateTeamDto })
  async createTeam(@Body() dto: CreateTeamDto): Promise<TeamResponseDto> {
    const userId = this.userContext.getCurrentUserId();
    try {
      winstonLogger.log(`User ${userId} creating team: ${dto.name}`, 'info');

      if (!dto.name || dto.name.trim().length === 0) {
        throw new BadRequestException('Team name is required');
      }

      if (dto.name.length > 255) {
        throw new BadRequestException('Team name must be less than 255 characters');
      }

      const team = await this.teamService.createTeam(userId, dto);
      winstonLogger.log(`Team created successfully: ${team.id}`, 'info');
      return team;
    } catch (error: any) {
      winstonLogger.log(`Failed to create team: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * List all teams for the current user
   * GET /teams
   */
  @Get()
  @swaggerDecorators.ApiListTeamsSwaggerDecorator()
  async listTeams(
    @CurrentUser() currentUser: AuthenticatedUserDto,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<TeamResponseDto[]> {
    const userId = currentUser.id;
    try {
      const safeSkip = Math.max(0, skip || 0);
      const safeTake = Math.min(100, Math.max(1, take || 20));

      const result = await this.teamService.listUserTeams(userId, safeSkip, safeTake);
      return result.teams;
    } catch (error: any) {
      winstonLogger.log(`Failed to list teams: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Get a specific team by ID
   * GET /teams/:id
   */
  @Get(':id')
  @swaggerDecorators.ApiGetTeamSwaggerDecorator()
  @UseGuards(RoleGuard)
  async getTeam(@Param('id') id: string): Promise<TeamResponseDto> {
    const userId = this.userContext.getCurrentUserId();
    try {

      const isMember = await this.permissionService.canAccessTeam(userId, id);
      if (!isMember) {
        throw new ForbiddenException('Unable to find the team or you are not a member of it');
      }

      const team = await this.teamService.getTeam(id, userId);
      if (!team) {
        throw new NotFoundException('Team not found');
      }
      return team;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Update team information
   * PUT /teams/:id
   */
  @Put(':id')
  @swaggerDecorators.ApiUpdateTeamSwaggerDecorator()
  @UseGuards(RoleGuard)
  async updateTeam(@Param('id') id: string, @Body() dto: UpdateTeamDto): Promise<TeamResponseDto> {
    const userId = this.userContext.getCurrentUserId();
    try {
      winstonLogger.log(`User ${userId} updating team ${id}`, 'info');

      const isAdmin = await this.permissionService.hasTeamRole(userId, id, 'ADMIN');
      if (!isAdmin) {
        winstonLogger.log(`User ${userId} denied admin access to team ${id}`, 'warn');
        throw new ForbiddenException('Only ADMIN members can update team information');
      }

      if (dto.name && dto.name.length > 255) {
        throw new BadRequestException('Team name must be less than 255 characters');
      }

      const team = await this.teamService.updateTeam(id, userId, dto);
      winstonLogger.log(`Team ${id} updated successfully`, 'info');
      return team;
    } catch (error: any) {
      winstonLogger.log(`Failed to update team: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Delete a team (owner only)
   * DELETE /teams/:id
   */
  @Delete(':id')
  @swaggerDecorators.ApiDeleteTeamSwaggerDecorator()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTeam(@Param('id') id: string): Promise<void> {
    const userId = this.userContext.getCurrentUserId();
    try {
      winstonLogger.log(`User ${userId} deleting team ${id}`, 'info');

      const isOwner = await this.permissionService.isTeamOwner(userId, id);
      if (!isOwner) {
        winstonLogger.log(`User ${userId} denied ownership check for team ${id}`, 'warn');
        throw new ForbiddenException('Only team owner can delete the team');
      }

      await this.teamService.deleteTeam(id, userId);
      winstonLogger.log(`Team ${id} deleted successfully`, 'info');
    } catch (error: any) {
      winstonLogger.log(`Failed to delete team: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Get all members of a team
   * GET /teams/:id/members
   */
  @Get(':id/members')
  @swaggerDecorators.ApiGetTeamMembersSwaggerDecorator()
  @UseGuards(RoleGuard)
  async getMembers(
    @Param('id') id: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<TeamMemberResponseDto[]> {
    const userId = this.userContext.getCurrentUserId();
    try {
      const isMember = await this.permissionService.canAccessTeam(userId, id);
      if (!isMember) {
        throw new ForbiddenException('Unable to find the team or you are not a member of it');
      }

      const safeSkip = Math.max(0, parseInt(String(skip)) || 0);
      const safeTake = Math.min(100, Math.max(1, parseInt(String(take)) || 50));

      const result = await this.teamService.getTeamMembers(id, userId, safeSkip, safeTake);
      winstonLogger.log(`Retrieved ${result.members.length} members from team ${id}`, 'info');
      return result.members;
    } catch (error: any) {
      winstonLogger.log(`Failed to get team members: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Add a member to the team
   * POST /teams/:id/members
   */
  @Post(':id/members')
  @swaggerDecorators.ApiAddTeamMemberSwaggerDecorator()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RoleGuard)
  async addMember(
    @Param('id') id: string,
    @Body() dto: AddTeamMemberDto,
  ): Promise<TeamMemberResponseDto> {
    const userId = this.userContext.getCurrentUserId();
    try {
      winstonLogger.log(`User ${userId} adding member to team ${id}`, 'info');

      const isAdmin = await this.permissionService.hasTeamRole(userId, id, 'ADMIN');
      if (!isAdmin) {
        throw new ForbiddenException('Only ADMIN members can add new members');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dto.email)) {
        throw new BadRequestException('Invalid email format');
      }

      const validRoles = ['ADMIN', 'EDITOR', 'VIEWER'];
      if (!validRoles.includes(dto.role)) {
        throw new BadRequestException('Invalid role. Must be ADMIN, EDITOR, or VIEWER');
      }

      const member = await this.memberService.addTeamMember(id, userId, dto);
      winstonLogger.log(`Member ${member.userId} added to team ${id}`, 'info');
      return this.toMemberResponse(member);
    } catch (error: any) {
      winstonLogger.log(`Failed to add member: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Update a member role
   * PUT /teams/:id/members/:memberId
   */
  @Put(':id/members/:memberId')
  @swaggerDecorators.ApiUpdateTeamMemberSwaggerDecorator()
  @UseGuards(RoleGuard)
  async updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateTeamMemberDto,
  ): Promise<TeamMemberResponseDto> {
    const userId = this.userContext.getCurrentUserId();
    try {
      winstonLogger.log(`User ${userId} updating role for member ${memberId} in team ${id}`, 'info');

      const isAdmin = await this.permissionService.hasTeamRole(userId, id, 'ADMIN');
      if (!isAdmin) {
        throw new ForbiddenException('Only ADMIN members can update member roles');
      }

      const validRoles = ['ADMIN', 'EDITOR', 'VIEWER'];
      if (!validRoles.includes(dto.role)) {
        throw new BadRequestException('Invalid role. Must be ADMIN, EDITOR, or VIEWER');
      }

      const member = await this.memberService.updateMemberRole(id, memberId, userId, dto);
      winstonLogger.log(`Member ${memberId} role updated to ${dto.role} in team ${id}`, 'info');
      return this.toMemberResponse(member);
    } catch (error: any) {
      winstonLogger.log(`Failed to update member role: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Remove a member from the team
   * DELETE /teams/:id/members/:memberId
   */
  @Delete(':id/members/:memberId')
  @swaggerDecorators.ApiDeleteTeamMemberSwaggerDecorator()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RoleGuard)
  async removeMember(@Param('id') id: string, @Param('memberId') memberId: string): Promise<void> {
    const userId = this.userContext.getCurrentUserId();
    try {
      winstonLogger.log(`User ${userId} removing member ${memberId} from team ${id}`, 'info');

      const isAdmin = await this.permissionService.hasTeamRole(userId, id, 'ADMIN');
      if (!isAdmin) {
        throw new ForbiddenException('Only ADMIN members can remove members');
      }

      await this.memberService.removeTeamMember(id, memberId, userId);
      winstonLogger.log(`Member ${memberId} removed from team ${id}`, 'info');
    } catch (error: any) {
      winstonLogger.log(`Failed to remove member: ${error.message}`, 'error');
      throw error;
    }
  }

  private toMemberResponse(member: {
    id: string;
    userId: string;
    role: 'ADMIN' | 'EDITOR' | 'VIEWER';
    joinedAt: Date;
    user: { email: string; name: string | null };
  }): TeamMemberResponseDto {
    return {
      id: member.id,
      userId: member.userId,
      email: member.user.email,
      name: member.user.name ?? undefined,
      role: member.role,
      joinedAt: member.joinedAt,
    };
  }
}
