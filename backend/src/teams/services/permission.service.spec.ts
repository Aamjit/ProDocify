import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PermissionService } from './permission.service.js';

describe('PermissionService', () => {
    let prisma: any;
    let service: PermissionService;

    beforeEach(() => {
        prisma = {
            teamMember: { findFirst: vi.fn() },
            team: { findUnique: vi.fn() },
            teamDocument: { findUnique: vi.fn() },
        };
        service = new PermissionService(prisma as any);
    });

    it('canAccessTeam returns true when membership exists', async () => {
        prisma.teamMember.findFirst.mockResolvedValue({ id: 'm1' });

        expect(await service.canAccessTeam('user-1', 'team-1')).toBe(true);
    });

    it('isTeamOwner returns false when team not found', async () => {
        prisma.team.findUnique.mockResolvedValue(null);

        expect(await service.isTeamOwner('user-1', 'team-1')).toBe(false);
    });

    it('canManageTeam returns true for owner', async () => {
        prisma.team.findUnique.mockResolvedValue({ ownerId: 'user-1' });

        expect(await service.canManageTeam('user-1', 'team-1')).toBe(true);
    });

    it('canEditTeamDocument returns false when doc missing', async () => {
        prisma.teamDocument.findUnique.mockResolvedValue(null);

        expect(await service.canEditTeamDocument('user-1', 'doc-1')).toBe(false);
    });

    it('hasTeamRole returns true for ADMIN and any role check', async () => {
        vi.spyOn(service, 'getUserTeamRole').mockResolvedValue('ADMIN');

        expect(await service.hasTeamRole('user-1', 'team-1', 'EDITOR')).toBe(true);
    });
});
