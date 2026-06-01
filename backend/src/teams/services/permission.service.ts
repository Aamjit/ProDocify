import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Check if user can access a team
   */
  async canAccessTeam(userId: string, teamId: string): Promise<boolean> {
    try {
      const membership = await this.prisma.teamMember.findFirst({
        where: { teamId, userId },
      });
      return !!membership;
    } catch (error: any) {
      this.logger.error(`Error checking team access: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if user can manage team (owner or admin)
   */
  async canManageTeam(userId: string, teamId: string): Promise<boolean> {
    try {
      const team = await this.prisma.team.findUnique({
        where: { id: teamId },
        select: { ownerId: true },
      });

      if (!team) return false;

      // Owner can always manage
      if (team.ownerId === userId) return true;

      // Admin members can manage
      const membership = await this.prisma.teamMember.findFirst({
        where: { teamId, userId },
      });

      return membership?.role === 'ADMIN';
    } catch (error: any) {
      this.logger.error(`Error checking team management permission: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if user is team owner
   */
  async isTeamOwner(userId: string, teamId: string): Promise<boolean> {
    try {
      const team = await this.prisma.team.findUnique({
        where: { id: teamId },
        select: { ownerId: true },
      });
      return team?.ownerId === userId;
    } catch (error: any) {
      this.logger.error(`Error checking team ownership: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if user can access team document
   */
  async canAccessTeamDocument(userId: string, documentId: string): Promise<boolean> {
    try {
      const doc = await this.prisma.teamDocument.findUnique({
        where: { id: documentId },
        select: { teamId: true },
      });

      if (!doc) return false;

      const membership = await this.prisma.teamMember.findFirst({
        where: { teamId: doc.teamId, userId },
      });

      return !!membership;
    } catch (error: any) {
      this.logger.error(`Error checking document access: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if user can edit team document (needs EDITOR or ADMIN role)
   */
  async canEditTeamDocument(userId: string, documentId: string): Promise<boolean> {
    try {
      const doc = await this.prisma.teamDocument.findUnique({
        where: { id: documentId },
        select: { teamId: true },
      });

      if (!doc) return false;

      const membership = await this.prisma.teamMember.findFirst({
        where: { teamId: doc.teamId, userId },
      });

      return !!membership && (membership.role === 'ADMIN' || membership.role === 'EDITOR');
    } catch (error: any) {
      this.logger.error(`Error checking edit permission: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if user can delete team document (needs ADMIN or is owner)
   */
  async canDeleteTeamDocument(userId: string, documentId: string): Promise<boolean> {
    try {
      const doc = await this.prisma.teamDocument.findUnique({
        where: { id: documentId },
        select: { teamId: true, ownerId: true },
      });

      if (!doc) return false;

      // Document owner can delete
      if (doc.ownerId === userId) {
        const membership = await this.prisma.teamMember.findFirst({
          where: { teamId: doc.teamId, userId },
        });
        return !!membership && (membership.role === 'ADMIN' || membership.role === 'EDITOR');
      }

      // Team admin can delete
      const membership = await this.prisma.teamMember.findFirst({
        where: { teamId: doc.teamId, userId },
      });

      return membership?.role === 'ADMIN';
    } catch (error: any) {
      this.logger.error(`Error checking delete permission: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if user can manage team members (needs ADMIN role)
   */
  async canManageTeamMembers(userId: string, teamId: string): Promise<boolean> {
    try {
      const membership = await this.prisma.teamMember.findFirst({
        where: { teamId, userId },
      });

      return membership?.role === 'ADMIN';
    } catch (error: any) {
      this.logger.error(`Error checking member management permission: ${error.message}`);
      return false;
    }
  }

  /**
   * Get user's role in team
   */
  async getUserTeamRole(userId: string, teamId: string): Promise<string | null> {
    try {
      const membership = await this.prisma.teamMember.findFirst({
        where: { teamId, userId },
      });
      return membership?.role || null;
    } catch (error: any) {
      this.logger.error(`Error fetching user team role: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if user has specific role in team
   */
  async hasTeamRole(userId: string, teamId: string, role: string): Promise<boolean> {
    try {
      const userRole = await this.getUserTeamRole(userId, teamId);

      if (!userRole) return false;

      // Admin has all permissions
      if (userRole === 'ADMIN') return true;

      // Check specific role
      if (role === 'ADMIN') return false;
      if (role === 'EDITOR') return userRole === 'EDITOR' || userRole === 'ADMIN';
      if (role === 'VIEWER') return true; // All members are viewers

      return false;
    } catch (error: any) {
      this.logger.error(`Error checking team role: ${error.message}`);
      return false;
    }
  }
}
