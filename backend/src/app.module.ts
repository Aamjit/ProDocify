import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaUserContextInterceptor } from './common/prisma-user-context.interceptor.js';
import { DocumentsModule } from './documents/documents.module.js';
import { FoldersModule } from './folders/folders.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { TeamsModule } from './teams/teams.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DocumentsModule,
    FoldersModule,
    TeamsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PrismaUserContextInterceptor,
    },
    AppService,
  ],
})
export class AppModule { }
