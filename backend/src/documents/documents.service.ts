import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
    constructor(private readonly prisma: PrismaService) { }

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

    create(data: CreateDocumentDto) {
        return this.prisma.document.create({
            data
        });
    }

    update(id: string, data: UpdateDocumentDto) {
        return this.prisma.document.update({
            where: { id },
            data
        });
    }

    remove(id: string) {
        return this.prisma.document.delete({
            where: { id }
        });
    }
}
