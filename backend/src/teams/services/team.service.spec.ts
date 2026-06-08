import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { TeamService } from './team.service.js';

describe('TeamService', () => {
    let prisma: any;
    let service: TeamService;

    beforeEach(() => {
        prisma = {
            team: {
                create: vi.fn(),
                findUnique: vi.fn(),
                findMany: vi.fn(),
                count: vi.fn(),
                update: vi.fn(),
                delete: vi.fn(),
            },
            teamMember: {
                findFirst: vi.fn(),
                findMany: vi.fn(),
                count: vi.fn(),
            },
        };
        service = new TeamService(prisma as any);
    });

    it('createTeam returns created team', async () => {
        const team = { id: 'team-1', name: 'My Team' };
        prisma.team.create.mockResolvedValue(team);

        const result = await service.createTeam('user-1', { name: 'My Team', description: 'desc' });

        expect(prisma.team.create).toHaveBeenCalled();
        expect(result).toEqual(team);
    });

    it('createTeam throws BadRequestException for duplicate team name', async () => {
        prisma.team.create.mockRejectedValue({ code: 'P2002', message: 'Unique constraint failed' });

        await expect(service.createTeam('user-1', { name: 'My Team', description: 'desc' })).rejects.toBeInstanceOf(
            BadRequestException,
        );
    });

    it('getTeam returns team when user is a member', async () => {
        const team = { id: 'team-1', members: [{ userId: 'user-1' }] };
        prisma.team.findUnique.mockResolvedValue(team);

        const result = await service.getTeam('team-1', 'user-1');

        expect(result).toEqual(team);
    });

    it('getTeam throws ForbiddenException when user is not a member', async () => {
        const team = { id: 'team-1', members: [{ userId: 'other-user' }] };
        prisma.team.findUnique.mockResolvedValue(team);

        await expect(service.getTeam('team-1', 'user-1')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('listUserTeams returns teams and total count', async () => {
        const teams = [{ id: 'team-1' }];
        prisma.team.findMany.mockResolvedValue(teams);
        prisma.team.count.mockResolvedValue(1);

        const result = await service.listUserTeams('user-1', 0, 10);

        expect(result).toEqual({ teams, total: 1, skip: 0, take: 10 });
    });

    it('updateTeam throws ForbiddenException when user is not owner', async () => {
        prisma.team.findUnique.mockResolvedValue({ ownerId: 'other-user', name: 'My Team' });

        await expect(service.updateTeam('team-1', 'user-1', { name: 'New Name' })).rejects.toBeInstanceOf(
            ForbiddenException,
        );
    });

    it('deleteTeam returns success message when user is owner', async () => {
        prisma.team.findUnique.mockResolvedValue({ ownerId: 'user-1', name: 'My Team' });
        prisma.team.delete.mockResolvedValue({});

        const result = await service.deleteTeam('team-1', 'user-1');

        expect(result).toEqual({ message: 'Team "My Team" deleted successfully' });
    });

    it('getTeamMembers returns paged team members when user has membership', async () => {
        prisma.teamMember.findFirst.mockResolvedValue({ id: 'm1', role: 'ADMIN' });
        prisma.teamMember.findMany.mockResolvedValue([{ id: 'm1', user: { id: 'user-1' } }]);
        prisma.teamMember.count.mockResolvedValue(1);

        const result = await service.getTeamMembers('team-1', 'user-1', 0, 10);

        expect(result).toEqual({ members: [{ id: 'm1', user: { id: 'user-1' } }], total: 1, skip: 0, take: 10 });
    });

    it('verifyTeamOwnership returns true when owner matches', async () => {
        prisma.team.findUnique.mockResolvedValue({ ownerId: 'user-1' });

        const result = await service.verifyTeamOwnership('team-1', 'user-1');

        expect(result).toBe(true);
    });
});
