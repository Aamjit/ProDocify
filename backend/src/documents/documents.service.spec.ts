import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DocumentsService } from './documents.service.js';

describe('DocumentsService', () => {
    let prisma: any;
    let versionService: any;
    let service: DocumentsService;

    beforeEach(() => {
        prisma = {
            folder: { findFirst: vi.fn() },
            runAsUser: vi.fn(async (callback: any) => callback(prisma)),
            document: {
                findMany: vi.fn(),
                create: vi.fn(),
                update: vi.fn(),
                delete: vi.fn(),
            },
        };
        versionService = {
            createVersion: vi.fn(),
        };

        service = new DocumentsService(prisma as any, versionService);
    });

    it('findAll returns documents for owner', async () => {
        const documents = [{ id: 'doc-1', ownerId: 'user-1' }];
        prisma.document.findMany.mockResolvedValue(documents);

        const result = await service.findAll('user-1');

        expect(prisma.document.findMany).toHaveBeenCalledWith({ where: { ownerId: 'user-1' }, include: { folder: true } });
        expect(result).toEqual(documents);
    });

    it('create throws when folder does not belong to owner', async () => {
        prisma.folder.findFirst.mockResolvedValue(null);

        await expect(
            service.create({ title: 'Test', content: 'hello', folderId: 'folder-1' }, 'user-1'),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('create creates document and version when folder exists', async () => {
        const document = { id: 'doc-1', title: 'Title', content: 'hello', ownerId: 'user-1' };
        prisma.folder.findFirst.mockResolvedValue({ id: 'folder-1', ownerId: 'user-1' });
        prisma.document.create.mockResolvedValue(document);

        const result = await service.create({ title: 'Title', content: 'hello', folderId: 'folder-1' }, 'user-1');

        expect(result).toEqual(document);
        expect(versionService.createVersion).toHaveBeenCalledWith('doc-1', {
            content: 'hello',
            changelog: 'Initial content for document "Title"',
        }, 'user-1');
    });

    it('remove deletes the document', async () => {
        prisma.document.delete.mockResolvedValue({ id: 'doc-1', ownerId: 'user-1' });

        const result = await service.remove('user-1', 'doc-1');

        expect(prisma.document.delete).toHaveBeenCalledWith({ where: { id: 'doc-1', ownerId: 'user-1' } });
        expect(result).toEqual({ id: 'doc-1', ownerId: 'user-1' });
    });
});
