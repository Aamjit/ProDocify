import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { TeamDocumentService } from './team-document.service.js';

describe('TeamDocumentService', () => {
    let prisma: any;
    let permissionService: any;
    let versionService: any;
    let service: TeamDocumentService;

    beforeEach(() => {
        prisma = {
            team: { findUnique: vi.fn() },
            teamFolder: { findUnique: vi.fn() },
            teamDocument: { create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn() },
            teamDocumentVersion: { findMany: vi.fn(), create: vi.fn() },
        };
        permissionService = {
            hasTeamRole: vi.fn(),
            canAccessTeamDocument: vi.fn(),
            canAccessTeam: vi.fn(),
            canEditTeamDocument: vi.fn(),
            canDeleteTeamDocument: vi.fn(),
        };
        versionService = { createVersion: vi.fn() };
        service = new TeamDocumentService(prisma as any, permissionService as any, versionService as any);
    });

    it('createTeamDocument creates document when user has edit permission', async () => {
        permissionService.hasTeamRole.mockResolvedValue(true);
        prisma.team.findUnique.mockResolvedValue({ id: 'team-1' });
        prisma.teamFolder.findUnique.mockResolvedValue({ id: 'folder-1', teamId: 'team-1' });
        prisma.teamDocument.create.mockResolvedValue({
            id: 'doc-1',
            teamId: 'team-1',
            folderId: 'folder-1',
            title: 'Title',
            content: 'Hello',
            currentVersion: 1,
            owner: { id: 'user-1', email: 'test@example.com', name: 'Test' },
            team: { id: 'team-1', name: 'Team Name' },
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const result = await service.createTeamDocument('team-1', 'user-1', {
            title: 'Title',
            content: 'Hello',
            folderId: 'folder-1',
            changelog: 'Initial',
        });

        expect(result.title).toBe('Title');
        expect(prisma.teamDocument.create).toHaveBeenCalled();
    });

    it('createTeamDocument throws ForbiddenException when user lacks edit role', async () => {
        permissionService.hasTeamRole.mockResolvedValue(false);

        await expect(
            service.createTeamDocument('team-1', 'user-1', { title: 'Title' }),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('getTeamDocument throws NotFoundException when team does not exist', async () => {
        prisma.team.findUnique.mockResolvedValue(null);

        await expect(service.getTeamDocument('team-1', 'doc-1', 'user-1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('listTeamDocuments returns formatted documents when user is member', async () => {
        permissionService.canAccessTeam.mockResolvedValue(true);
        prisma.teamDocument.findMany.mockResolvedValue([
            {
                id: 'doc-1',
                teamId: 'team-1',
                title: 'Title',
                content: 'Hello',
                currentVersion: 1,
                owner: { id: 'user-1', email: 'test@example.com', name: 'Test' },
                team: { id: 'team-1', name: 'Team Name' },
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);

        const result = await service.listTeamDocuments('team-1', 'user-1');

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({ title: 'Title' });
    });

    it('updateTeamDocument throws ForbiddenException when no edit permission', async () => {
        prisma.teamDocument.findUnique.mockResolvedValue({ id: 'doc-1', teamId: 'team-1', content: 'old', currentVersion: 1 });
        permissionService.canEditTeamDocument.mockResolvedValue(false);

        await expect(
            service.updateTeamDocument('team-1', 'doc-1', 'user-1', { content: 'new' }),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('deleteTeamDocument throws NotFoundException when document missing', async () => {
        prisma.teamDocument.findUnique.mockResolvedValue(null);
        permissionService.canDeleteTeamDocument.mockResolvedValue(true);

        await expect(service.deleteTeamDocument('team-1', 'doc-1', 'user-1')).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });
});
