import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // Configure PrismaClient with explicit datasource URL
    // Connection pool settings are configured via DATABASE_URL query parameters:
    // - connection_limit: max connections in pool (default: 10)
    // - pool_timeout: timeout for getting connection (default: 10s)
    // - connect_timeout: timeout for establishing connection (default: 5s)
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    });

    // Handle Prisma connection errors gracefully
    this.$on('error' as never, (e: any) => {
      this.logger.error('Prisma error:', e);
    });

    // Handle query events for debugging (dev only)
    if (process.env.NODE_ENV === 'development') {
      this.$on('query' as never, (e: any) => {
        if (e.duration > 1000) {
          this.logger.warn(`Slow query detected: ${e.duration}ms - ${e.query.substring(0, 100)}...`);
        }
      });
    }
  }

  // REMOVED onModuleInit - Prisma connects lazily on first query
  // This prevents blocking app startup if database is unavailable
  // Connection will happen automatically on first database operation
  // PostgreSQL idle connection termination is handled by Prisma's connection pool

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Database disconnected gracefully');
    } catch (error) {
      this.logger.error('Error disconnecting from database', error);
    }
  }
}
