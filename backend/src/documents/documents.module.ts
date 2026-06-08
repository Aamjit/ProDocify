import { Module } from '@nestjs/common';
import { UserContextService } from '../common/user-context.service.js';
import { DocumentVersionService } from './document-version.service.js';
import { DocumentsController } from './documents.controller.js';
import { DocumentsService } from './documents.service.js';
@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentVersionService, UserContextService],
  exports: [UserContextService],
})
export class DocumentsModule { }
