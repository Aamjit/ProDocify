import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { RateLimiter, RateLimitConfig } from '../common/rate-limiter.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateVersionDto } from './dto/create-version.dto.js';

@Injectable()
export class DocumentVersionService {
  private readonly logger = new Logger(DocumentVersionService.name);
  private readonly rateLimiter: RateLimiter;
  private readonly transactionTimeout = 10000; // 10 seconds
  private readonly maxContentSize = 10 * 1024 * 1024; // 10MB

  constructor(private readonly prisma: PrismaService) {
    const rateLimitConfig: RateLimitConfig = {
      limit: 100, // 100 versions per user
      window: 3600, // per hour
    };
    this.rateLimiter = new RateLimiter(rateLimitConfig);
  }

  async createVersion(documentId: string, data: CreateVersionDto, userId: string) {
    try {
      // Rate limit check
      this.rateLimiter.checkLimit(`version_create:${userId}`);

      // Validate content size
      if (data.content && data.content.length > this.maxContentSize) {
        throw new BadRequestException(
          `Content size exceeds maximum allowed size of ${this.maxContentSize / 1024 / 1024}MB`,
        );
      }

      // Validate changelog length
      if (data.changelog && data.changelog.length > 500) {
        throw new BadRequestException('Changelog must not exceed 500 characters');
      }

      // Execute in explicit transaction with Serializable isolation
      const version = await this.prisma.$transaction(
        async (tx: any) => {
          // Lock and fetch document to prevent race conditions
          const document = await tx.document.findUnique({
            where: { id: documentId },
          });

          if (!document) {
            throw new NotFoundException(`Document with ID ${documentId} not found`);
          }

          if (document.ownerId !== userId) {
            throw new BadRequestException('Only document owner can create versions');
          }

          // Calculate next version number atomically
          const nextVersionNumber = +document.currentVersion + 1;

          // Create version and update document atomically
          const createdVersion = await tx.documentVersion.create({
            data: {
              documentId: documentId,
              versionNumber: nextVersionNumber,
              content: data.content,
              changelog: data.changelog || null,
              createdBy: userId,
            },
            include: { creator: { select: { id: true, email: true, name: true } } },
          });

          // Update document in same transaction
          await tx.document.update({
            where: { id: documentId },
            data: {
              content: data.content,
              currentVersion: nextVersionNumber,
              updatedAt: new Date(),
            },
          });

          return createdVersion;
        },
        {
          maxWait: this.transactionTimeout,
          timeout: this.transactionTimeout,
          isolationLevel: 'Serializable',
        },
      );

      this.logger.debug(
        `Version ${version.versionNumber} created for document ${documentId} by user ${userId}`,
      );

      return version;
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Error creating version for document ${documentId}: ${error.message}`,
        error.stack,
      );

      if (error.code === 'P2034') {
        throw new BadRequestException('Concurrent edit detected. Please retry the operation.');
      }

      throw new BadRequestException('Failed to create version. Please try again.');
    }
  }

  async getVersionHistory(documentId: string, skip = 0, take = 20, userId: string) {
    try {
      // Validate pagination parameters
      if (skip < 0 || take < 1 || take > 100) {
        throw new BadRequestException(
          'Invalid pagination parameters. Skip must be >= 0, take must be between 1 and 100.',
        );
      }

      // Execute in transaction for consistency
      const [versions, total, document] = await this.prisma.$transaction([
        this.prisma.documentVersion.findMany({
          where: { documentId },
          include: { creator: { select: { id: true, email: true, name: true } } },
          orderBy: { versionNumber: 'desc' },
          skip,
          take,
        }),
        this.prisma.documentVersion.count({ where: { documentId } }),
        this.prisma.document.findUnique({ where: { id: documentId } }),
      ]);

      if (!document) {
        throw new NotFoundException(`Document with ID ${documentId} not found`);
      }

      if (document.ownerId !== userId) {
        throw new BadRequestException('Only document owner can view version history');
      }

      this.logger.debug(
        `Retrieved version history for document ${documentId}: ${versions.length}/${total} versions`,
      );

      return { versions, total, skip, take };
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Error retrieving version history for document ${documentId}: ${error.message}`,
        error.stack,
      );

      throw new BadRequestException('Failed to retrieve version history.');
    }
  }

  async getVersion(documentId: string, versionNumber: number, userId: string) {
    try {
      // Validate version number
      if (versionNumber < 1 || !Number.isInteger(versionNumber)) {
        throw new BadRequestException('Version number must be a positive integer.');
      }

      // Execute in transaction for consistency
      const [document, version] = await this.prisma.$transaction([
        this.prisma.document.findUnique({ where: { id: documentId } }),
        this.prisma.documentVersion.findUnique({
          where: {
            documentId_versionNumber: { documentId, versionNumber },
          },
          include: { creator: { select: { id: true, email: true, name: true } } },
        }),
      ]);

      if (!document) {
        throw new NotFoundException(`Document with ID ${documentId} not found`);
      }

      if (document.ownerId !== userId) {
        throw new BadRequestException('Only document owner can view versions');
      }

      if (!version) {
        throw new NotFoundException(
          `Version ${versionNumber} not found for document ${documentId}`,
        );
      }

      this.logger.debug(`Retrieved version ${versionNumber} for document ${documentId}`);

      return version;
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Error retrieving version ${versionNumber} for document ${documentId}: ${error.message}`,
        error.stack,
      );

      throw new BadRequestException('Failed to retrieve version.');
    }
  }

  async rollbackToVersion(documentId: string, versionNumber: number, userId: string) {
    try {
      // Validate version number
      if (versionNumber < 1 || !Number.isInteger(versionNumber)) {
        throw new BadRequestException('Version number must be a positive integer.');
      }

      // Rate limit check
      this.rateLimiter.checkLimit(`version_rollback:${userId}`);

      // Execute in explicit transaction with Serializable isolation
      const result = await this.prisma.$transaction(
        async (tx) => {
          // Fetch document
          const document = await tx.document.findUnique({
            where: { id: documentId },
          });

          if (!document) {
            throw new NotFoundException(`Document with ID ${documentId} not found`);
          }

          if (document.ownerId !== userId) {
            throw new BadRequestException('Only document owner can rollback versions');
          }

          // Fetch target version
          const targetVersion = await tx.documentVersion.findUnique({
            where: {
              documentId_versionNumber: { documentId, versionNumber },
            },
          });

          if (!targetVersion) {
            throw new NotFoundException(
              `Version ${versionNumber} not found for document ${documentId}`,
            );
          }

          // Prevent rolling back to current version
          if (versionNumber === document.currentVersion) {
            throw new BadRequestException(
              'Cannot rollback to the current version. Please select a different version.',
            );
          }

          const nextVersionNumber = document.currentVersion + 1;

          // Create rollback version entry
          const rollbackVersion = await tx.documentVersion.create({
            data: {
              documentId,
              versionNumber: nextVersionNumber,
              content: targetVersion.content,
              changelog: `Rollback to version ${versionNumber}`,
              createdBy: userId,
            },
            include: { creator: { select: { id: true, email: true, name: true } } },
          });

          // Update document with rolled-back content
          const updatedDocument = await tx.document.update({
            where: { id: documentId },
            data: {
              content: targetVersion.content,
              currentVersion: nextVersionNumber,
              updatedAt: new Date(),
            },
            include: { owner: { select: { id: true, email: true, name: true } } },
          });

          return { rollbackVersion, updatedDocument };
        },
        {
          maxWait: this.transactionTimeout,
          timeout: this.transactionTimeout,
          isolationLevel: 'Serializable',
        },
      );

      this.logger.debug(
        `Document ${documentId} rolled back to version ${versionNumber} by user ${userId}`,
      );

      return {
        message: `Document rolled back to version ${versionNumber}`,
        version: result.rollbackVersion,
        document: result.updatedDocument,
      };
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Error rolling back version ${versionNumber} for document ${documentId}: ${error.message}`,
        error.stack,
      );

      if (error.code === 'P2034') {
        throw new BadRequestException(
          'Concurrent edit detected during rollback. Please retry the operation.',
        );
      }

      throw new BadRequestException('Failed to rollback version. Please try again.');
    }
  }

  async compareVersions(
    documentId: string,
    versionNumber1: number,
    versionNumber2: number,
    userId: string,
  ) {
    try {
      // Validate version numbers
      if (
        !Number.isInteger(versionNumber1) ||
        !Number.isInteger(versionNumber2) ||
        versionNumber1 < 1 ||
        versionNumber2 < 1
      ) {
        throw new BadRequestException('Version numbers must be positive integers.');
      }

      if (versionNumber1 === versionNumber2) {
        throw new BadRequestException(
          'Cannot compare a version with itself. Please select two different versions.',
        );
      }

      // Execute in transaction for consistency
      const [document, version1, version2] = await this.prisma.$transaction([
        this.prisma.document.findUnique({ where: { id: documentId } }),
        this.prisma.documentVersion.findUnique({
          where: {
            documentId_versionNumber: { documentId, versionNumber: versionNumber1 },
          },
          include: { creator: { select: { id: true, email: true, name: true } } },
        }),
        this.prisma.documentVersion.findUnique({
          where: {
            documentId_versionNumber: { documentId, versionNumber: versionNumber2 },
          },
          include: { creator: { select: { id: true, email: true, name: true } } },
        }),
      ]);

      if (!document) {
        throw new NotFoundException(`Document with ID ${documentId} not found`);
      }

      if (document.ownerId !== userId) {
        throw new BadRequestException('Only document owner can compare versions');
      }

      if (!version1 || !version2) {
        throw new NotFoundException('One or both versions not found');
      }

      // Calculate detailed changes
      const oldLength = version1.content.length;
      const newLength = version2.content.length;
      const olderVersion = versionNumber1 < versionNumber2 ? version1 : version2;
      const newerVersion = versionNumber1 < versionNumber2 ? version2 : version1;

      this.logger.debug(
        `Compared versions ${versionNumber1} and ${versionNumber2} for document ${documentId}`,
      );

      return {
        olderVersion: olderVersion,
        newerVersion: newerVersion,
        changes: {
          oldLength,
          newLength,
          lengthDifference: newLength - oldLength,
          percentageChange: oldLength > 0 ? ((newLength - oldLength) / oldLength) * 100 : 0,
        },
      };
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Error comparing versions for document ${documentId}: ${error.message}`,
        error.stack,
      );

      throw new BadRequestException('Failed to compare versions.');
    }
  }

  async deleteOldVersions(documentId: string, keepCount = 50) {
    try {
      // Validate keepCount
      if (keepCount < 1 || !Number.isInteger(keepCount) || keepCount > 1000) {
        throw new BadRequestException('Keep count must be a positive integer between 1 and 1000.');
      }

      // Execute in transaction for consistency
      const result = await this.prisma.$transaction(async (tx: any) => {
        // Get total version count
        const totalVersions = await tx.documentVersion.count({
          where: { documentId },
        });

        if (totalVersions <= keepCount) {
          return { deletedCount: 0, message: 'No versions to delete' };
        }

        // Get versions to delete (keep the most recent ones)
        const versionsToDelete = await tx.documentVersion.findMany({
          where: { documentId },
          orderBy: { versionNumber: 'desc' },
          skip: keepCount,
          select: { id: true },
        });

        const deleteIds = versionsToDelete.map((v: any) => v.id);

        if (deleteIds.length > 0) {
          await tx.documentVersion.deleteMany({
            where: { id: { in: deleteIds } },
          });
        }

        return {
          deletedCount: deleteIds.length,
          remainingVersions: keepCount,
        };
      });

      this.logger.debug(
        `Deleted ${result.deletedCount} old versions for document ${documentId}, keeping ${result.remainingVersions}`,
      );

      return result;
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `Error deleting old versions for document ${documentId}: ${error.message}`,
        error.stack,
      );

      throw new BadRequestException('Failed to delete old versions. Please try again.');
    }
  }

  /**
   * Get rate limiting statistics (for monitoring and debugging)
   */
  getRateLimitStats() {
    return this.rateLimiter.getStats();
  }
}
