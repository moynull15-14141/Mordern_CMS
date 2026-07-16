import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { FeatureFlags } from '../core/feature-flags/feature-flags.interface';

export interface AppConfigShape {
  name: string;
  version: string;
  env: string;
  port: number;
  apiPrefix: string;
  corsOrigins: string[];
  throttle: { ttl: number; limit: number };
}

export interface DatabaseConfigShape {
  url: string;
}

export interface AuthConfigShape {
  jwtSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  rememberMeExpiresIn: string;
  passwordResetTokenExpiresIn: string;
  emailVerificationTokenExpiresIn: string;
}

export interface CacheConfigShape {
  redisUrl: string;
  provider: string;
}

export interface StorageConfigShape {
  provider: string;
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface AiConfigShape {
  enabled: boolean;
  provider: string;
  model: string;
  apiKey: string;
  baseUrl: string;
  timeout: number;
  temperature: number;
  maxTokens: number;
  retry: number;
}

export interface SearchConfigShape {
  enabled: boolean;
  engine: string;
  host: string;
  apiKey: string;
  timeout: number;
}

/**
 * Typed facade over @nestjs/config so the rest of the backend depends on
 * AppConfigService.app/.database/.auth/.cache/.storage/.ai/.search/.features
 * instead of untyped string-keyed config.get() calls scattered across modules.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: NestConfigService) {}

  get app(): AppConfigShape {
    return this.config.get<AppConfigShape>('app', { infer: true })!;
  }

  get database(): DatabaseConfigShape {
    return this.config.get<DatabaseConfigShape>('database', { infer: true })!;
  }

  get auth(): AuthConfigShape {
    return this.config.get<AuthConfigShape>('auth', { infer: true })!;
  }

  get cache(): CacheConfigShape {
    return this.config.get<CacheConfigShape>('cache', { infer: true })!;
  }

  get storage(): StorageConfigShape {
    return this.config.get<StorageConfigShape>('storage', { infer: true })!;
  }

  get ai(): AiConfigShape {
    return this.config.get<AiConfigShape>('ai', { infer: true })!;
  }

  get search(): SearchConfigShape {
    return this.config.get<SearchConfigShape>('search', { infer: true })!;
  }

  get features(): FeatureFlags {
    return this.config.get<FeatureFlags>('features', { infer: true })!;
  }
}
