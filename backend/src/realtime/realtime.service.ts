// src/realtime/realtime.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { DocumentVersion } from '@prisma/client';

@Injectable()
export class RealtimeService {
    constructor(private readonly prisma: PrismaService) { }

    async getLatestSnapshot(documentId: string): Promise<DocumentVersion | null> {
        return this.prisma.documentVersion.findFirst({
            where: { documentId },
            orderBy: { versionNumber: 'desc' },
        });
    }

    async persistVersion(
        documentId: string,
        update: any,               // could be a Yjs binary update or JSON patch
        userId: string,
    ): Promise<DocumentVersion> {
        // Convert the update to a string (or binary) that you store.
        // For a simple implementation you could just store the whole content.
        const content = typeof update === 'string' ? update : JSON.stringify(update);

        // Determine the next version number
        const last = await this.prisma.documentVersion.findFirst({
            where: { documentId },
            orderBy: { versionNumber: 'desc' },
        });
        const nextVersion = (last?.versionNumber ?? 0) + 1;

        return this.prisma.documentVersion.create({
            data: {
                documentId,
                versionNumber: nextVersion,
                content,
                createdBy: userId,
            },
        });
    }
}