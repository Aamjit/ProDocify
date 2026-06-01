import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as Sentry from '@sentry/nestjs';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) { }

  @Get('hello')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Server is healthy',
    schema: { example: { message: 'Welcome to ProDocify backend', status: 'ok' } },
  })
  getRoot() {
    return this.appService.getWelcome();
  }

  @Get('/debug-sentry')
  getError() {
    // Send a log before throwing the error
    Sentry.logger.info('User triggered test error', {
      action: 'test_error_endpoint',
    });
    // Send a test metric before throwing the error
    Sentry.metrics.count('test_counter', 1);
    throw new Error('My first Sentry error!');
  }

  @Get('db-health')
  @ApiOperation({ summary: 'Prisma connectivity health check' })
  async getPrismaHealth() {
    try {
      // Simple lightweight check using unsafe raw to avoid interpolation/runtime tag issues
      // Use $queryRaw with a template literal for a simple SELECT 1 check
      // Use a regular Prisma query to verify connectivity (no raw SQL needed)
      this.prisma.user
        .findFirst({ select: { id: true } })
        .then(() => {
          console.log('DB Health Check - User model query successful');
        })
        .catch((err: any) => {
          console.error('DB Health Check - Prisma query error:', err);
        });
    } catch (err: any) {
      // Log full error server-side and return sanitized message to client
      console.error('Prisma health check error:', err);
      return { status: 'error', error: err?.message ?? String(err) };
    }
  }
}
