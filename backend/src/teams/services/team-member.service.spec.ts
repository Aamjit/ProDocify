import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { TeamMemberService } from './team-member.service.js';

describe('TeamMemberService', () => {
    let prisma: any;
    let service: TeamMemberService;

    beforeEach(() => {
        prisma = {
            teamMember: {
                findFirst: vi.fn(),
                findUnique: vi.fn(),
                create: vi.fn(),
                delete: vi.fn(),
                update: vi.fn(),
            },
            user: {
                findUnique: vi.fn(),
            },
            teamDocument: {
                findUnique: vi.fn(),
            },
        };
        service = new TeamMemberService(prisma as any);
    });

    it('addTeamMember creates a new member when caller is admin', async () => {
        prisma.teamMember.findFirst
            .mockResolvedValueOnce({ id: 'admin-1', role: 'ADMIN' })
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce(null);
        prisma.user.findUnique.mockResolvedValue({ id: 'user-2', email: 'test@example.com' });
        prisma.teamMember.create.mockResolvedValue({ id: 'member-1', user: { id: 'user-2' } });

        const result = await service.addTeamMember('team-1', 'user-1', { email: 'test@example.com', role: 'VIEWER' });

        expect(result).toEqual({ id: 'member-1', user: { id: 'user-2' } });
        expect(prisma.teamMember.create).toHaveBeenCalled();
    });

    it('addTeamMember throws ForbiddenException when requester is not admin', async () => {
        prisma.teamMember.findFirst.mockResolvedValue({ id: 'member-1', role: 'VIEWER' });

        await expect(
            service.addTeamMember('team-1', 'user-1', { email: 'test@example.com', role: 'VIEWER' }),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('removeTeamMember throws BadRequestException when removing self', async () => {
        prisma.teamMember.findFirst.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });

        await expect(service.removeTeamMember('team-1', 'user-1', 'user-1')).rejects.toBeInstanceOf(
            BadRequestException,
        );
    });

    it('removeTeamMember deletes member when admin requester', async () => {
        prisma.teamMember.findFirst
            .mockResolvedValueOnce({ id: 'admin-1', role: 'ADMIN' });
        prisma.teamMember.findUnique.mockResolvedValue({ id: 'member-1', teamId: 'team-1', user: { email: 'test@example.com' } });
        prisma.teamMember.delete.mockResolvedValue({});

        const result = await service.removeTeamMember('team-1', 'member-1', 'user-1');

        expect(result).toEqual({ message: 'User test@example.com removed from team' });
    });

    it('updateMemberRole changes role when admin requester and valid role', async () => {
        prisma.teamMember.findFirst
            .mockResolvedValueOnce({ id: 'admin-1', role: 'ADMIN' });
        prisma.teamMember.findUnique.mockResolvedValue({ id: 'member-1', teamId: 'team-1', userId: 'user-2' });
        prisma.teamMember.update.mockResolvedValue({ id: 'member-1', role: 'EDITOR', user: { id: 'user-2' } });

        const result = await service.updateMemberRole('team-1', 'member-1', 'user-1', { role: 'EDITOR' });

        expect(result).toEqual({ id: 'member-1', role: 'EDITOR', user: { id: 'user-2' } });
    });

    it('getTeamMember returns member when found', async () => {
        prisma.teamMember.findUnique.mockResolvedValue({ id: 'member-1', teamId: 'team-1', user: { id: 'user-2' } });

        const result = await service.getTeamMember('team-1', 'member-1');

        expect(result).toEqual({ id: 'member-1', teamId: 'team-1', user: { id: 'user-2' } });
    });

    it('canAccessTeamDocument returns false when document not found', async () => {
        prisma.teamDocument.findUnique.mockResolvedValue(null);

        const result = await service.canAccessTeamDocument('user-1', 'doc-1');

        expect(result).toBe(false);
    });

    it('canEditTeamDocument returns true when membership role is EDITOR', async () => {
        prisma.teamDocument.findUnique.mockResolvedValue({ teamId: 'team-1' });
        prisma.teamMember.findFirst.mockResolvedValue({ role: 'EDITOR' });

        const result = await service.canEditTeamDocument('user-1', 'doc-1');

        expect(result).toBe(true);
    });
});
