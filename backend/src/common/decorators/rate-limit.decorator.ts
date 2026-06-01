import { UseGuards, applyDecorators } from '@nestjs/common';
import { RateLimitGuard } from '../rate-limit.guard.js';

export interface RateLimitDecoratorOptions {
  limit: number; // max requests
  window: number; // time window in seconds
  keyGenerator?: (request: any) => string; // custom key generator
}

/**
 * Decorator to apply rate limiting to endpoints
 *
 * @param options - Rate limit configuration
 *
 * @example
 * @Post(':id/versions')
 * @RateLimit({ limit: 100, window: 3600 })
 * async createVersion(...) { ... }
 */
export function RateLimit(options: RateLimitDecoratorOptions) {
  return applyDecorators(UseGuards(new RateLimitGuard(options)));
}
