import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RealtimeService } from './realtime.service.js';

describe('RealtimeService', () => {
    let prisma: any;
    let service: RealtimeService;

    beforeEach(() => {
        prisma = {
            documentVersion: {
                findFirst: vi.fn(),
                create: vi.fn(),
            },
        };
        service = new RealtimeService(prisma as any);
    });

    it('getLatestSnapshot returns latest version', async () => {
        const latest = { id: 'v2', documentId: 'doc-1', versionNumber: 2 };
        prisma.documentVersion.findFirst.mockResolvedValue(latest);

        const result = await service.getLatestSnapshot('doc-1');

        expect(prisma.documentVersion.findFirst).toHaveBeenCalledWith({
            where: { documentId: 'doc-1' },
            orderBy: { versionNumber: 'desc' },
        });
        expect(result).toEqual(latest);
    });

    it('persistVersion creates a new version from a string update', async () => {
        prisma.documentVersion.findFirst.mockResolvedValue({ versionNumber: 3 });
        prisma.documentVersion.create.mockResolvedValue({
            id: 'v4',
            documentId: 'doc-1',
            versionNumber: 4,
            content: 'hello',
            createdBy: 'user-1',
        });

        const result = await service.persistVersion('doc-1', 'hello', 'user-1');

        expect(prisma.documentVersion.create).toHaveBeenCalledWith({
            data: {
                documentId: 'doc-1',
                versionNumber: 4,
                content: 'hello',
                createdBy: 'user-1',
            },
        });
        expect(result).toEqual({
            id: 'v4',
            documentId: 'doc-1',
            versionNumber: 4,
            content: 'hello',
            createdBy: 'user-1',
        });
    });

    it('persistVersion creates version with JSON content when update is object', async () => {
        prisma.documentVersion.findFirst.mockResolvedValue({ versionNumber: 1 });
        prisma.documentVersion.create.mockResolvedValue({
            id: 'v2',
            documentId: 'doc-1',
            versionNumber: 2,
            content: '{"ops":[{"insert":"hi"}]}',
            createdBy: 'user-1',
        });

        const update = { ops: [{ insert: 'hi' }] };
        const result = await service.persistVersion('doc-1', update, 'user-1');

        expect(prisma.documentVersion.create).toHaveBeenCalledWith({
            data: {
                documentId: 'doc-1',
                versionNumber: 2,
                content: JSON.stringify(update),
                createdBy: 'user-1',
            },
        });
        expect(result).toEqual({
            id: 'v2',
            documentId: 'doc-1',
            versionNumber: 2,
            content: JSON.stringify(update),
            createdBy: 'user-1',
        });
    });
});
