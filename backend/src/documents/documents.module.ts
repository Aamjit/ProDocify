import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentVersionService } from './document-version.service';
import { DocumentsController } from './documents.controller';

@Module({
    controllers: [DocumentsController],
    providers: [DocumentsService, DocumentVersionService]
})
export class DocumentsModule { }
