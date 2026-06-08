import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConflictException } from '@nestjs/common';

vi.mock('bcrypt', () => ({
    hash: vi.fn(async () => 'hashed-password'),
    compare: vi.fn(async () => true),
}));

import { UsersService } from './users.service.js';

describe('UsersService', () => {
    let prisma: any;
    let service: UsersService;

    beforeEach(() => {
        prisma = {
            user: {
                findUnique: vi.fn(),
                create: vi.fn(),
            },
        };
        service = new UsersService(prisma as any);
    });

    it('findByEmail calls prisma.user.findUnique', async () => {
        prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@example.com' });

        const user = await service.findByEmail('test@example.com');

        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
        expect(user).toEqual({ id: '1', email: 'test@example.com' });
    });

    it('create throws when email format is invalid', async () => {
        await expect(service.create({ email: 'invalid-email', password: 'secret' })).rejects.toBeInstanceOf(
            ConflictException,
        );
    });

    it('create throws when user already exists', async () => {
        prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@example.com' });

        await expect(service.create({ email: 'test@example.com', password: 'secret' })).rejects.toBeInstanceOf(
            ConflictException,
        );

        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('create hashes password and creates a new user', async () => {
        prisma.user.findUnique.mockResolvedValue(null);
        prisma.user.create.mockResolvedValue({ id: '1', email: 'test@example.com', password: 'hashed-password' });

        const user = await service.create({ email: 'test@example.com', password: 'secret' });

        expect(user).toEqual({ id: '1', email: 'test@example.com', password: 'hashed-password' });
        expect(prisma.user.create).toHaveBeenCalledWith({
            data: { email: 'test@example.com', password: 'hashed-password' },
        });
    });
});
