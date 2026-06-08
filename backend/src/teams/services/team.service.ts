import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateTeamDto, UpdateTeamDto } from '../dto/team.dto.js';

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(private readonly prisma: PrismaService) { }

  async createTeam(userId: string, data: CreateTeamDto): Promise<any> {
    try {
      const team = await this.prisma.team.create({
        data: {
          name: data.name,
          description: data.description,
          ownerId: userId,
          members: {
            create: {
              userId,
              role: 'ADMIN',
            },
          },
        },
        include: {
          owner: { select: { id: true, email: true, name: true } },
          members: {
            include: { user: { select: { id: true, email: true, name: true } } },
          },
        },
      });

      this.logger.debug(`Team "${team.name}" created by user ${userId}`);
      return team;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Team with this name already exists in your workspace');
      }
      this.logger.error(`Error creating team: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create team');
    }
  }

  async getTeam(teamId: string, userId: string): Promise<any> {
    try {
      const team = await this.prisma.team.findUnique({
        where: { id: teamId },
        include: {
          owner: { select: { id: true, email: true, name: true } },
          members: {
            include: { user: { select: { id: true, email: true, name: true } } },
          },
          _count: {
            select: { documents: true },
          },
        },
      });

      if (!team) {
        throw new NotFoundException('Team not found');
      }

      // Verify user is member of team
      const isMember = team.members.some((m) => m.userId === userId);
      if (!isMember) {
        throw new ForbiddenException('You are not a member of this team');
      }

      return team;
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error fetching team ${teamId}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch team');
    }
  }

  async listUserTeams(userId: string, skip = 0, take = 20): Promise<any> {
    try {
      const [teams, total] = await Promise.all([
        this.prisma.team.findMany({
          where: {
            members: {
              some: { userId },
            },
          },
          include: {
            owner: { select: { id: true, email: true, name: true } },
            members: {
              select: { role: true, joinedAt: true, user: { select: { email: true, name: true } } },
            },
            _count: {
              select: { documents: true, members: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
          skip,
          take,
        }),
        this.prisma.team.count({
          where: {
            members: {
              some: { userId, role: { in: ['ADMIN', 'VIEWER'] } },
            },
          },
        }),
      ]);

      this.logger.debug(`Retrieved ${teams.length} teams for user ${userId}`);
      return { teams, total, skip, take };
    } catch (error: any) {
      this.logger.error(`Error listing teams for user ${userId}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch teams');
    }
  }

  async updateTeam(teamId: string, userId: string, data: UpdateTeamDto): Promise<any> {
    try {
      // Verify user is owner
      const team = await this.prisma.team.findUnique({
        where: { id: teamId },
        select: { ownerId: true, name: true },
      });

      if (!team) {
        throw new NotFoundException('Team not found');
      }

      if (team.ownerId !== userId) {
        throw new ForbiddenException('Only team owner can update team');
      }

      const updated = await this.prisma.team.update({
        where: { id: teamId },
        data: {
          name: data.name || team.name,
          description: data.description,
        },
        include: {
          owner: { select: { id: true, email: true, name: true } },
          members: {
            include: { user: { select: { id: true, email: true, name: true } } },
          },
        },
      });

      this.logger.debug(`Team ${teamId} updated by user ${userId}`);
      return updated;
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Team name already exists in your workspace');
      }
      this.logger.error(`Error updating team ${teamId}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to update team');
    }
  }

  async deleteTeam(teamId: string, userId: string): Promise<{ message: string }> {
    try {
      const team = await this.prisma.team.findUnique({
        where: { id: teamId },
        select: { ownerId: true, name: true },
      });

      if (!team) {
        throw new NotFoundException('Team not found');
      }

      if (team.ownerId !== userId) {
        throw new ForbiddenException('Only team owner can delete team');
      }

      await this.prisma.team.delete({ where: { id: teamId } });

      this.logger.debug(`Team ${teamId} deleted by user ${userId}`);
      return { message: `Team "${team.name}" deleted successfully` };
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error deleting team ${teamId}: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to delete team');
    }
  }

  async getTeamMembers(teamId: string, userId: string, skip = 0, take = 50): Promise<any> {
    try {
      // Verify user is member
      const membership = await this.prisma.teamMember.findFirst({
        where: { teamId, userId, role: { in: ['ADMIN', 'EDITOR', 'VIEWER'] } },
      });

      if (!membership) {
        throw new ForbiddenException('You are not a member of this team');
      }

      const [members, total] = await Promise.all([
        this.prisma.teamMember.findMany({
          where: { teamId },
          include: {
            user: { select: { id: true, email: true, name: true } },
          },
          orderBy: { joinedAt: 'desc' },
          skip,
          take,
        }),
        this.prisma.teamMember.count({ where: { teamId } }),
      ]);

      this.logger.debug(`Retrieved ${members.length} members for team ${teamId}`);
      return { members, total, skip, take };
    } catch (error: any) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error fetching team members: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch team members');
    }
  }

  async verifyTeamMembership(teamId: string, userId: string) {
    return this.prisma.teamMember.findFirst({
      where: { teamId, userId },
    });
  }

  async verifyTeamOwnership(teamId: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      select: { ownerId: true },
    });

    return team?.ownerId === userId;
  }
}
