import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DocumentVersionService } from './document-version.service.js';

describe('DocumentVersionService', () => {
    let prisma: any;
    let service: DocumentVersionService;

    beforeEach(() => {
        prisma = {
            $transaction: vi.fn(),
            document: {
                findUnique: vi.fn(),
            },
            documentVersion: {
                create: vi.fn(),
            },
        };

        service = new DocumentVersionService(prisma as any);
    });

    it('createVersion throws when document does not exist', async () => {
        prisma.$transaction.mockImplementation(async (cb: any) => cb(prisma));
        prisma.document.findUnique.mockResolvedValue(null);

        await expect(
            service.createVersion('doc-1', { content: 'hello', changelog: 'init' }, 'user-1'),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('createVersion throws when content is too large', async () => {
        const content = 'a'.repeat(10 * 1024 * 1024 + 1);

        await expect(
            service.createVersion('doc-1', { content, changelog: 'init' }, 'user-1'),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('createVersion returns created version when document exists', async () => {
        const createdVersion = { versionNumber: 2, content: 'hello' };
        prisma.$transaction.mockImplementation(async (cb: any) => cb(prisma));
        prisma.document.findUnique.mockResolvedValue({ id: 'doc-1', ownerId: 'user-1', currentVersion: 1 });
        prisma.documentVersion.create.mockResolvedValue(createdVersion);
        prisma.document.update = vi.fn().mockResolvedValue({});

        const result = await service.createVersion('doc-1', { content: 'hello', changelog: 'init' }, 'user-1');

        expect(result).toEqual(createdVersion);
        expect(prisma.documentVersion.create).toHaveBeenCalled();
        expect(prisma.document.update).toHaveBeenCalledWith({
            where: { id: 'doc-1' },
            data: { content: 'hello', currentVersion: 2, updatedAt: expect.any(Date) },
        });
    });
});
