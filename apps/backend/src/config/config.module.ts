import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { aiConfig } from './ai.config';
import { appConfig } from './app.config';
import { authConfig } from './auth.config';
import { cacheConfig } from './cache.config';
import { AppConfigService } from './config.service';
import { databaseConfig } from './database.config';
import { validateEnv } from './env.validation';
import { featureFlagsConfig } from './feature-flags.config';
import { searchConfig } from './search.config';
import { storageConfig } from './storage.config';

const nodeEnv = process.env.NODE_ENV ?? 'development';

/**
 * Loads config/env/<NODE_ENV>.env relative to the backend app's cwd (the
 * dev/build/start scripts always run with cwd = apps/backend), validates it
 * with class-validator, and exposes typed config via AppConfigService.
 * `.env.local` is checked first so developers can override values without
 * touching the shared environment files.
 */
@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', `../../config/env/${nodeEnv}.env`],
      load: [
        appConfig,
        databaseConfig,
        authConfig,
        cacheConfig,
        storageConfig,
        aiConfig,
        searchConfig,
        featureFlagsConfig,
      ],
      validate: validateEnv,
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class ConfigModule {}
