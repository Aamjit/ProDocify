import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentVersionService } from './document-version.service';

@Injectable()
export class DocumentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly versionService: DocumentVersionService
    ) { }

    findAll() {
        return this.prisma.document.findMany({
            include: { folder: true }
        });
    }

    findOne(id: string) {
        return this.prisma.document.findUnique({
            where: { id },
            include: { folder: true }
        });
    }

    async create(data: CreateDocumentDto, userId?: string) {
        // If content is being updated and userId is provided, create a version
        const document = await this.prisma.document.create({
            data
        });

        if (document && userId) {
            await this.versionService.createVersion(document.id, userId, {
                content: document.content,
                changelog: document.title ? `Initial content for document "${document.title}"` : 'Initial content'
            });
        }

        return document;
    }

    async update(id: string, data: UpdateDocumentDto, userId?: string) {
        // If content is being updated and userId is provided, create a version
        if (data.content && userId) {
            await this.versionService.createVersion(id, userId, {
                content: data.content,
                changelog: data.changelog
            });
        }

        return this.prisma.document.update({
            where: { id },
            data: {
                title: data.title,
                folderId: data.folderId,
                ownerId: data.ownerId
            }
        });
    }

    remove(id: string) {
        return this.prisma.document.delete({
            where: { id }
        });
    }
}

