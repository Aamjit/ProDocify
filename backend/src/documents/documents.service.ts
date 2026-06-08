import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { DocumentVersionService } from './document-version.service.js';
import { CreateDocumentDto } from './dto/create-document.dto.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';
import { Document } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly versionService: DocumentVersionService,
  ) { }

  findAll(ownerId: string): Promise<Document[]> {
    return this.prisma.document.findMany({ where: { ownerId }, include: { folder: true } });
  }

  findOne(ownerId: string, id: string): Promise<Document | null> {
    return this.prisma.runAsUser((prisma) =>
      prisma.document.findUnique({ where: { id, ownerId }, include: { folder: true } }),
    );
  }

  async create(data: CreateDocumentDto, ownerId: string): Promise<any> {
    await this.validateFolderOwnership(ownerId, data.folderId);

    const document = await this.prisma.runAsUser((prisma) =>
      prisma.document.create({ data: { ...data, ownerId } }),
    );

    if (document) {
      await this.versionService.createVersion(
        document.id,
        {
          content: document.content ?? '',
          changelog: document.title
            ? `Initial content for document "${document.title}"`
            : 'Initial content',
        },
        ownerId,
      );
    }

    return document;
  }

  async update(ownerId: string, id: string, data: UpdateDocumentDto): Promise<any> {
    await this.validateFolderOwnership(ownerId, data.folderId);

    if (data.content) {
      await this.versionService.createVersion(
        id,
        {
          content: data.content,
          changelog: data.changelog,
        },
        ownerId,
      );
    }

    return this.prisma.runAsUser((prisma) =>
      prisma.document.update({
        where: { id, ownerId },
        data: { title: data.title, folderId: data.folderId },
      }),
    );
  }

  remove(ownerId: string, id: string): Promise<any> {
    return this.prisma.runAsUser((prisma) =>
      prisma.document.delete({ where: { id, ownerId } }),
    );
  }

  private async validateFolderOwnership(ownerId: string, folderId?: string): Promise<void> {
    if (!folderId) {
      return;
    }

    const folder = await this.prisma.folder.findFirst({
      where: { id: folderId, ownerId },
    });

    if (!folder) {
      throw new NotFoundException(`Folder ID: ${folderId} not found`);
    }
  }
}
