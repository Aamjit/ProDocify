import { Module } from '@nestjs/common';
import { UserContextService } from '../common/user-context.service.js';
import { FoldersController } from './folders.controller.js';
import { FoldersService } from './folders.service.js';

@Module({
  controllers: [FoldersController],
  providers: [FoldersService, UserContextService],
})
export class FoldersModule { }
