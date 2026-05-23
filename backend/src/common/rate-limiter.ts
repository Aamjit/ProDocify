import { Injectable, TooManyRequestsException } from '@nestjs/common';
import { Request } from 'express';

export interface RateLimitConfig {
  limit: number;
  window: number; // in seconds
  keyGenerator?: (request: Request, userId?: string) => string;
}

interface RequestRecord {
  timestamps: number[];
}

@Injectable()
export class RateLimiter {
  private requests = new Map<string, RequestRecord>();
  private readonly config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;

    // Cleanup old entries every 5 minutes
    setInterval(() => this.cleanupExpiredEntries(), 5 * 60 * 1000);
  }

  checkLimit(identifier: string): void {
    const now = Date.now();
    const windowMs = this.config.window * 1000;

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, { timestamps: [] });
    }

    const record = this.requests.get(identifier)!;
    const recentTimestamps = record.timestamps.filter(t => now - t < windowMs);

    if (recentTimestamps.length >= this.config.limit) {
      const remainingSeconds = Math.ceil((recentTimestamps[0] + windowMs - now) / 1000);
      throw new TooManyRequestsException(
        `Rate limit exceeded: Maximum ${this.config.limit} requests per ${this.config.window} seconds. Retry after ${remainingSeconds}s`
      );
    }

    recentTimestamps.push(now);
    record.timestamps = recentTimestamps;
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const windowMs = this.config.window * 1000;

    for (const [key, record] of this.requests.entries()) {
      record.timestamps = record.timestamps.filter(t => now - t < windowMs);
      if (record.timestamps.length === 0) {
        this.requests.delete(key);
      }
    }
  }

  getStats(): { totalTrackedKeys: number; totalRequests: number } {
    let totalRequests = 0;
    for (const record of this.requests.values()) {
      totalRequests += record.timestamps.length;
    }
    return {
      totalTrackedKeys: this.requests.size,
      totalRequests
    };
  }
}

// Factory function for creating rate limiters with different configs
export function createRateLimiter(config: RateLimitConfig): RateLimiter {
  return new RateLimiter(config);
}
