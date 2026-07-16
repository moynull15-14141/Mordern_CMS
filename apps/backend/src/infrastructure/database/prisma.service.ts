import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppConfigService } from '../../config/config.service';
import { AppLoggerService } from '../../core/logger/app-logger.service';

/**
 * Thin Prisma adapter: owns the connection lifecycle and exposes a health
 * check for the readiness endpoint. No repositories or domain models are
 * defined here — schema.prisma still only has the placeholder model.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(
    config: AppConfigService,
    private readonly logger: AppLoggerService,
  ) {
    super({ datasources: { db: { url: config.database.url } } });
    this.logger.setContext(PrismaService.name);
  }

  async onModuleInit(): Promise<void> {
    // Deliberately not eager: Prisma connects lazily on first query. Forcing
    // $connect() here would throw during Nest's bootstrap if the database is
    // unreachable, taking down /health and /live with it — those two must
    // stay up independent of database state. /ready is the only endpoint
    // that touches the database, via isHealthy() below.
    this.logger.log('Database adapter initialized (lazy connect)');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.warn('Database health check failed', { error: (error as Error).message });
      return false;
    }
  }
}
