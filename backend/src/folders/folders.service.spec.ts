import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FoldersService } from './folders.service.js';

describe('FoldersService', () => {
    let prisma: any;
    let userContext: any;
    let service: FoldersService;

    beforeEach(() => {
        prisma = {
            runAsUser: vi.fn(async (callback: any) => callback(prisma)),
            folder: {
                findMany: vi.fn(),
                findUnique: vi.fn(),
                create: vi.fn(),
                update: vi.fn(),
                delete: vi.fn(),
            },
        };

        userContext = {
            getCurrentUserId: vi.fn().mockReturnValue('user-1'),
        };

        service = new FoldersService(prisma as any, userContext as any);
    });

    it('findAll returns folders for current user', async () => {
        const folders = [{ id: 'folder-1', ownerId: 'user-1' }];
        prisma.folder.findMany.mockResolvedValue(folders);

        const result = await service.findAll();

        expect(prisma.folder.findMany).toHaveBeenCalledWith({
            where: { ownerId: 'user-1' },
            include: { documents: true },
        });
        expect(result).toEqual(folders);
    });

    it('findOne loads folder by id and user', async () => {
        const folder = { id: 'folder-1', ownerId: 'user-1' };
        prisma.folder.findUnique.mockResolvedValue(folder);

        const result = await service.findOne('folder-1');

        expect(prisma.folder.findUnique).toHaveBeenCalledWith({
            where: { id: 'folder-1', ownerId: 'user-1' },
            include: { documents: true },
        });
        expect(result).toEqual(folder);
    });

    it('create saves a new folder for current user', async () => {
        const createdFolder = { id: 'folder-1', name: 'My Folder', ownerId: 'user-1' };
        prisma.folder.create.mockResolvedValue(createdFolder);

        const result = await service.create({ name: 'My Folder' });

        expect(prisma.folder.create).toHaveBeenCalledWith({
            data: { name: 'My Folder', ownerId: 'user-1' },
        });
        expect(result).toEqual(createdFolder);
    });

    it('update modifies a folder owned by current user', async () => {
        const updatedFolder = { id: 'folder-1', name: 'Updated', ownerId: 'user-1' };
        prisma.folder.update.mockResolvedValue(updatedFolder);

        const result = await service.update('folder-1', { name: 'Updated' });

        expect(prisma.folder.update).toHaveBeenCalledWith({
            where: { id: 'folder-1', ownerId: 'user-1' },
            data: { name: 'Updated' },
        });
        expect(result).toEqual(updatedFolder);
    });

    it('remove deletes a folder owned by current user', async () => {
        const deletedFolder = { id: 'folder-1', ownerId: 'user-1' };
        prisma.folder.delete.mockResolvedValue(deletedFolder);

        const result = await service.remove('folder-1');

        expect(prisma.folder.delete).toHaveBeenCalledWith({
            where: { id: 'folder-1', ownerId: 'user-1' },
        });
        expect(result).toEqual(deletedFolder);
    });
});
