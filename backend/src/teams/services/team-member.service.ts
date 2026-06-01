import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AddTeamMemberDto, UpdateTeamMemberDto } from '../dto/team.dto.js';

@Injectable()
export class TeamMemberService {
  private readonly logger = new Logger(TeamMemberService.name);

  constructor(private readonly prisma: PrismaService) { }

  async addTeamMember(teamId: string, userId: string, data: AddTeamMemberDto) {
    try {
      // Verify requester is team admin
      const membership = await this.prisma.teamMember.findFirst({
        where: { teamId, userId },
      });

      if (!membership || membership.role !== 'ADMIN') {
        throw new ForbiddenException('Only team admins can add members');
      }

      // Find user by email
      const userToAdd = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!userToAdd) {
        throw new NotFoundException('User with this email not found');
      }

      if (userToAdd.id === userId) {
        throw new BadRequestException('Cannot add yourself to team');
      }

      // Check if already member
      const existingMember = await this.prisma.teamMember.findFirst({
        where: { teamId, userId: userToAdd.id },
      });

      if (existingMember) {
        throw new BadRequestException('User is already a team member');
      }

      // Add member
      const teamMember = await this.prisma.teamMember.create({
        data: {
          teamId,
          userId: userToAdd.id,
          role: data.role || 'VIEWER',
        },
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
      });

      this.logger.debug(`User ${userToAdd.id} added to team ${teamId} with role ${data.role}`);
      return teamMember;
    } catch (error: any) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('User is already a member of this team');
      }
      this.logger.error(`Error adding team member: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to add team member');
    }
  }

  async removeTeamMember(teamId: string, memberId: string, userId: string) {
    try {
      // Verify requester is team admin
      const requesterMembership = await this.prisma.teamMember.findFirst({
        where: { teamId, userId },
      });

      if (!requesterMembership || requesterMembership.role !== 'ADMIN') {
        throw new ForbiddenException('Only team admins can remove members');
      }

      // Cannot remove yourself
      if (memberId === userId) {
        throw new BadRequestException('Cannot remove yourself from team');
      }

      // Find and delete member
      const teamMember = await this.prisma.teamMember.findUnique({
        where: { id: memberId },
        include: { user: { select: { id: true, email: true } } },
      });

      if (!teamMember || teamMember.teamId !== teamId) {
        throw new NotFoundException('Team member not found');
      }

      await this.prisma.teamMember.delete({ where: { id: memberId } });

      this.logger.debug(`Member ${teamMember.user.id} removed from team ${teamId}`);
      return { message: `User ${teamMember.user.email} removed from team` };
    } catch (error: any) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Error removing team member: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to remove team member');
    }
  }

  async updateMemberRole(
    teamId: string,
    memberId: string,
    userId: string,
    data: UpdateTeamMemberDto,
  ) {
    try {
      // Verify requester is team admin
      const requesterMembership = await this.prisma.teamMember.findFirst({
        where: { teamId, userId },
      });

      if (!requesterMembership || requesterMembership.role !== 'ADMIN') {
        throw new ForbiddenException('Only team admins can update member roles');
      }

      // Cannot change your own role
      const memberToUpdate = await this.prisma.teamMember.findUnique({
        where: { id: memberId },
      });

      if (!memberToUpdate || memberToUpdate.teamId !== teamId) {
        throw new NotFoundException('Team member not found');
      }

      if (memberToUpdate.userId === userId) {
        throw new BadRequestException('Cannot change your own role');
      }

      // Validate role
      if (!['ADMIN', 'EDITOR', 'VIEWER'].includes(data.role)) {
        throw new BadRequestException('Invalid role. Must be ADMIN, EDITOR, or VIEWER');
      }

      const updated = await this.prisma.teamMember.update({
        where: { id: memberId },
        data: { role: data.role },
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
      });

      this.logger.debug(`Member ${memberToUpdate.userId} role updated to ${data.role}`);
      return updated;
    } catch (error: any) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Error updating member role: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to update member role');
    }
  }

  async getTeamMember(teamId: string, memberId: string) {
    try {
      const member = await this.prisma.teamMember.findUnique({
        where: { id: memberId },
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
      });

      if (!member || member.teamId !== teamId) {
        throw new NotFoundException('Team member not found');
      }

      return member;
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching team member: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch team member');
    }
  }

  async getUserTeamMembership(teamId: string, userId: string) {
    return this.prisma.teamMember.findFirst({
      where: { teamId, userId },
    });
  }

  async canAccessTeamDocument(userId: string, documentId: string): Promise<boolean> {
    const doc = await this.prisma.teamDocument.findUnique({
      where: { id: documentId },
      select: { teamId: true },
    });

    if (!doc) return false;

    const membership = await this.prisma.teamMember.findFirst({
      where: {
        teamId: doc.teamId,
        userId,
      },
    });

    return !!membership;
  }

  async canEditTeamDocument(userId: string, documentId: string): Promise<boolean> {
    const doc = await this.prisma.teamDocument.findUnique({
      where: { id: documentId },
      select: { teamId: true },
    });

    if (!doc) return false;

    const membership = await this.prisma.teamMember.findFirst({
      where: {
        teamId: doc.teamId,
        userId,
      },
    });

    return !!membership && (membership.role === 'ADMIN' || membership.role === 'EDITOR');
  }
}
