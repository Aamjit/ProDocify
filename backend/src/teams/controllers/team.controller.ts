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
  Logger,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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

@Controller('teams')
@ApiTags('Teams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class TeamController {
  private logger = new Logger('TeamController');

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
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({
    status: 201,
    description: 'Team created successfully',
    type: TeamResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data or team name already exists for this user',
  })
  async createTeam(@Body() dto: CreateTeamDto): Promise<TeamResponseDto> {
    const userId = this.userContext.getCurrentUserId();
    try {
      this.logger.log(`User ${userId} creating team: ${dto.name}`);

      if (!dto.name || dto.name.trim().length === 0) {
        throw new BadRequestException('Team name is required');
      }

      if (dto.name.length > 255) {
        throw new BadRequestException('Team name must be less than 255 characters');
      }

      const team = await this.teamService.createTeam(userId, dto);
      this.logger.log(`Team created successfully: ${team.id}`);
      return team;
    } catch (error: any) {
      this.logger.error(`Failed to create team: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * List all teams for the current user
   * GET /teams
   */
  @Get()
  @ApiOperation({ summary: 'List teams for current user' })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of teams to skip for pagination',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of teams to take for pagination (max 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'Teams retrieved successfully',
    isArray: true,
    type: TeamResponseDto,
  })
  async listTeams(
    @CurrentUser() currentUser: AuthenticatedUserDto,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<TeamResponseDto[]> {
    const userId = currentUser.id;
    try {
      this.logger.log(`User ${userId} listing teams`);

      const safeSkip = Math.max(0, skip || 0);
      const safeTake = Math.min(100, Math.max(1, take || 20));

      const result = await this.teamService.listUserTeams(userId, safeSkip, safeTake);
      this.logger.log(`Retrieved ${result.teams.length} teams for user ${userId}`);
      return result.teams;
    } catch (error: any) {
      this.logger.error(`Failed to list teams: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a specific team by ID
   * GET /teams/:id
   */
  @Get(':id')
  @UseGuards(RoleGuard)
  @ApiOperation({ summary: 'Get team details' })
  @ApiResponse({
    status: 200,
    description: 'Team retrieved successfully',
    type: TeamResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Team not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Not a member of this team',
  })
  async getTeam(@Param('id') id: string): Promise<TeamResponseDto> {
    const userId = this.userContext.getCurrentUserId();
    try {
      this.logger.log(`User ${userId} getting team ${id}`);

      const isMember = await this.permissionService.canAccessTeam(userId, id);
      if (!isMember) {
        this.logger.warn(`User ${userId} denied access to team ${id}`);
        throw new ForbiddenException('You are not a member of this team');
      }

      const team = await this.teamService.getTeam(id, userId);
      if (!team) {
        throw new NotFoundException('Team not found');
      }

      this.logger.log(`Team ${id} retrieved for user ${userId}`);
      return team;
    } catch (error: any) {
      this.logger.error(`Failed to get team: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update team information
   * PUT /teams/:id
   */
  @Put(':id')
  @UseGuards(RoleGuard)
  @ApiOperation({ summary: 'Update team information (ADMIN only)' })
  @ApiResponse({
    status: 200,
    description: 'Team updated successfully',
    type: TeamResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions (ADMIN role required)',
  })
  @ApiResponse({
    status: 404,
    description: 'Team not found',
  })
  async updateTeam(@Param('id') id: string, @Body() dto: UpdateTeamDto): Promise<TeamResponseDto> {
    const userId = this.userContext.getCurrentUserId();
    try {
      this.logger.log(`User ${userId} updating team ${id}`);

      const isAdmin = await this.permissionService.hasTeamRole(userId, id, 'ADMIN');
      if (!isAdmin) {
        this.logger.warn(`User ${userId} denied admin access to team ${id}`);
        throw new ForbiddenException('Only ADMIN members can update team information');
      }

      if (dto.name && dto.name.length > 255) {
        throw new BadRequestException('Team name must be less than 255 characters');
      }

      const team = await this.teamService.updateTeam(id, userId, dto);
      this.logger.log(`Team ${id} updated successfully`);
      return team;
    } catch (error: any) {
      this.logger.error(`Failed to update team: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a team (owner only)
   * DELETE /teams/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete team (owner only)' })
  @ApiResponse({
    status: 204,
    description: 'Team deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Only team owner can delete',
  })
  @ApiResponse({
    status: 404,
    description: 'Team not found',
  })
  async deleteTeam(@Param('id') id: string): Promise<void> {
    const userId = this.userContext.getCurrentUserId();
    try {
      this.logger.log(`User ${userId} deleting team ${id}`);

      const isOwner = await this.permissionService.isTeamOwner(userId, id);
      if (!isOwner) {
        this.logger.warn(`User ${userId} denied ownership check for team ${id}`);
        throw new ForbiddenException('Only team owner can delete the team');
      }

      await this.teamService.deleteTeam(id, userId);
      this.logger.log(`Team ${id} deleted successfully`);
    } catch (error: any) {
      this.logger.error(`Failed to delete team: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get team members
   * GET /teams/:id/members
   */
  @Get(':id/members')
  @UseGuards(RoleGuard)
  @ApiOperation({ summary: 'Get team members' })
  @ApiResponse({
    status: 200,
    description: 'Team members retrieved successfully',
    isArray: true,
    type: TeamMemberResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Not a member of this team',
  })
  async getMembers(
    @Param('id') id: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 50,
  ): Promise<TeamMemberResponseDto[]> {
    const userId = this.userContext.getCurrentUserId();
    try {
      this.logger.log(`User ${userId} listing members of team ${id}`);

      const isMember = await this.permissionService.canAccessTeam(userId, id);
      if (!isMember) {
        throw new ForbiddenException('You are not a member of this team');
      }

      const safeSkip = Math.max(0, parseInt(String(skip)) || 0);
      const safeTake = Math.min(100, Math.max(1, parseInt(String(take)) || 50));

      const result = await this.teamService.getTeamMembers(id, userId, safeSkip, safeTake);
      this.logger.log(`Retrieved ${result.members.length} members from team ${id}`);
      return result.members;
    } catch (error: any) {
      this.logger.error(`Failed to get team members: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Add a member to the team
   * POST /teams/:id/members
   */
  @Post(':id/members')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RoleGuard)
  @ApiOperation({ summary: 'Add member to team (ADMIN only)' })
  @ApiResponse({
    status: 201,
    description: 'Member added successfully',
    type: TeamMemberResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email or user already a member',
  })
  @ApiResponse({
    status: 403,
    description: 'Only ADMIN members can add members',
  })
  async addMember(
    @Param('id') id: string,
    @Body() dto: AddTeamMemberDto,
  ): Promise<TeamMemberResponseDto> {
    const userId = this.userContext.getCurrentUserId();
    try {
      this.logger.log(`User ${userId} adding member to team ${id}`);

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
      this.logger.log(`Member ${member.userId} added to team ${id}`);
      return this.toMemberResponse(member);
    } catch (error: any) {
      this.logger.error(`Failed to add member: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update member role
   * PUT /teams/:id/members/:memberId
   */
  @Put(':id/members/:memberId')
  @UseGuards(RoleGuard)
  @ApiOperation({ summary: 'Update member role (ADMIN only)' })
  @ApiResponse({
    status: 200,
    description: 'Member role updated successfully',
    type: TeamMemberResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot change your own role or invalid role',
  })
  @ApiResponse({
    status: 403,
    description: 'Only ADMIN members can update roles',
  })
  @ApiResponse({
    status: 404,
    description: 'Member not found',
  })
  async updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateTeamMemberDto,
  ): Promise<TeamMemberResponseDto> {
    const userId = this.userContext.getCurrentUserId();
    try {
      this.logger.log(`User ${userId} updating role for member ${memberId} in team ${id}`);

      const isAdmin = await this.permissionService.hasTeamRole(userId, id, 'ADMIN');
      if (!isAdmin) {
        throw new ForbiddenException('Only ADMIN members can update member roles');
      }

      const validRoles = ['ADMIN', 'EDITOR', 'VIEWER'];
      if (!validRoles.includes(dto.role)) {
        throw new BadRequestException('Invalid role. Must be ADMIN, EDITOR, or VIEWER');
      }

      const member = await this.memberService.updateMemberRole(id, memberId, userId, dto);
      this.logger.log(`Member ${memberId} role updated to ${dto.role} in team ${id}`);
      return this.toMemberResponse(member);
    } catch (error: any) {
      this.logger.error(`Failed to update member role: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Remove a member from the team
   * DELETE /teams/:id/members/:memberId
   */
  @Delete(':id/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RoleGuard)
  @ApiOperation({ summary: 'Remove member from team (ADMIN only)' })
  @ApiResponse({
    status: 204,
    description: 'Member removed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot remove yourself from team',
  })
  @ApiResponse({
    status: 403,
    description: 'Only ADMIN members can remove members',
  })
  @ApiResponse({
    status: 404,
    description: 'Member not found',
  })
  async removeMember(@Param('id') id: string, @Param('memberId') memberId: string): Promise<void> {
    const userId = this.userContext.getCurrentUserId();
    try {
      this.logger.log(`User ${userId} removing member ${memberId} from team ${id}`);

      const isAdmin = await this.permissionService.hasTeamRole(userId, id, 'ADMIN');
      if (!isAdmin) {
        throw new ForbiddenException('Only ADMIN members can remove members');
      }

      await this.memberService.removeTeamMember(id, memberId, userId);
      this.logger.log(`Member ${memberId} removed from team ${id}`);
    } catch (error: any) {
      this.logger.error(`Failed to remove member: ${error.message}`, error.stack);
      throw error;
    }
  }

  private toMemberResponse(member: {
    id: string;
    userId: string;
    role: string;
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
