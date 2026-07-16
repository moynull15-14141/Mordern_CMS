import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/config.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';

export interface AppInfo {
  status: 'ok';
  name: string;
  version: string;
  environment: string;
  uptimeSeconds: number;
  timestamp: string;
}

export interface LivenessStatus {
  status: 'ok';
  timestamp: string;
}

export interface ReadinessStatus {
  status: 'ok' | 'error';
  timestamp: string;
  checks: { database: 'up' | 'down' };
}

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  /** GET /health — application information, no dependency checks. */
  getInfo(): AppInfo {
    return {
      status: 'ok',
      name: this.config.app.name,
      version: this.config.app.version,
      environment: this.config.app.env,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  /** GET /live — simple liveness probe, no dependency checks. */
  getLiveness(): LivenessStatus {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /** GET /ready — readiness checks (database only, per this milestone's scope). */
  async getReadiness(): Promise<ReadinessStatus> {
    const isDatabaseHealthy = await this.prisma.isHealthy();
    return {
      status: isDatabaseHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      checks: { database: isDatabaseHealthy ? 'up' : 'down' },
    };
  }
}
