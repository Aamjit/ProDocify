import { Injectable } from '@nestjs/common';
import { UserContextService } from '../common/user-context.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateFolderDto } from './dto/create-folder.dto.js';
import { UpdateFolderDto } from './dto/update-folder.dto.js';

@Injectable()
export class FoldersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userContext: UserContextService,
  ) { }

  findAll(): Promise<any> {
    return this.prisma.runAsUser((prisma) =>
      (prisma as any).folder.findMany({
        where: { ownerId: this.userContext.getCurrentUserId() },
        include: { documents: true },
      }),
    );
  }

  findOne(id: string): Promise<any> {
    return this.prisma.runAsUser((prisma) =>
      (prisma as any).folder.findUnique({
        where: { id, ownerId: this.userContext.getCurrentUserId() },
        include: { documents: true },
      }),
    );
  }

  create(data: CreateFolderDto): Promise<any> {
    return this.prisma.runAsUser((prisma) =>
      (prisma as any).folder.create({
        data: { ...data, ownerId: this.userContext.getCurrentUserId() },
      }),
    );
  }

  update(id: string, data: UpdateFolderDto): Promise<any> {
    return this.prisma.runAsUser((prisma) =>
      (prisma as any).folder.update({
        where: { id, ownerId: this.userContext.getCurrentUserId() },
        data,
      }),
    );
  }

  remove(id: string): Promise<any> {
    return this.prisma.runAsUser((prisma) =>
      (prisma as any).folder.delete({
        where: { id, ownerId: this.userContext.getCurrentUserId() },
      }),
    );
  }
}
