import { AsyncLocalStorage } from 'async_hooks';
import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

interface PrismaRequestContext {
  userId?: string;
  skipSetUser?: boolean;
  inPrismaTransaction?: boolean;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy, OnModuleInit {
  private readonly requestContext = new AsyncLocalStorage<PrismaRequestContext>();
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    });
    super({ adapter });
  }

  private sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  async onModuleInit() {
    // Attempt to connect with retries to mitigate transient ECONNREFUSED errors
    const maxAttempts = 5;
    let attempt = 0;
    while (attempt < maxAttempts) {
      try {
        attempt++;
        this.logger.log(`Prisma connecting attempt ${attempt}/${maxAttempts}`);
        await this.$connect();
        this.logger.log('Prisma connected to database');
        return;
      } catch (err: any) {
        this.logger.warn(
          `Prisma connect attempt ${attempt} failed: ${err?.code ?? err?.message ?? err}`,
        );
        if (attempt >= maxAttempts) {
          this.logger.error('Prisma failed to connect after maximum retries');
          throw err;
        }
        // exponential backoff (in ms)
        const backoff = 500 * Math.pow(2, attempt - 1);
        this.logger.log(`Waiting ${backoff}ms before next attempt`);
        // wait before retrying
        // eslint-disable-next-line no-await-in-loop
        await this.sleep(backoff);
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Run database operations as the currently stored user (from AsyncLocalStorage).
   * If no user is stored, runs the callback with the global client.
   * Ensures `SET LOCAL app.current_user` is executed on the transaction connection.
   */
  async runAsUser<T>(callback: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    const store = this.requestContext.getStore();
    if (!store?.userId) {
      return callback(this as unknown as PrismaClient);
    }

    // Use PostgreSQL's set_config function to safely set a custom GUC.
    // This avoids syntax issues with the `SET LOCAL` statement when executed via Prisma's
    // $executeRaw (which sends the query as a prepared statement). The third argument `true`
    // makes the setting local to the current transaction.
    return this.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.current_user', ${store.userId}, true)`;
      return callback(tx as unknown as PrismaClient);
    });
  }

  runWithUser<T>(userId: string | undefined, callback: () => T): T {
    return this.requestContext.run({ userId }, callback);
  }

  private async executePrismaAction(tx: any, params: any) {
    if (params.model === null) {
      return Array.isArray(params.args)
        ? tx[params.action](...params.args)
        : tx[params.action](params.args);
    }

    return tx[params.model][params.action](params.args);
  }
}
