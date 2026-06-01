import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Request } from 'express';
import { RateLimitDecoratorOptions } from './decorators/rate-limit.decorator.js';
import { RateLimiter } from './rate-limiter.js';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly rateLimiters = new Map<string, RateLimiter>();

  constructor(private readonly options: RateLimitDecoratorOptions) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = this.generateKey(request);
    const limiter = this.getOrCreateLimiter(key);

    try {
      limiter.checkLimit(key);
      return true;
    } catch (error: any) {
      this.logger.warn(`Rate limit exceeded for ${key}: ${error.message}`);
      throw error;
    }
  }

  private generateKey(request: Request): string {
    if (this.options.keyGenerator) {
      return this.options.keyGenerator(request);
    }

    // Default: use user ID if available, otherwise IP address
    const userId = (request as any).user?.id;
    const userIdentifier = userId || request.ip || request.socket.remoteAddress || 'unknown';

    return `${this.options.limit}:${this.options.window}:${userIdentifier}`;
  }

  private getOrCreateLimiter(key: string): RateLimiter {
    let limiter = this.rateLimiters.get(key);

    if (!limiter) {
      limiter = new RateLimiter({
        limit: this.options.limit,
        window: this.options.window,
      });
      this.rateLimiters.set(key, limiter);
    }

    return limiter;
  }
}
