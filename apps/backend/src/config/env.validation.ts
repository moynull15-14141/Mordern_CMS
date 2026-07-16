import { plainToInstance } from 'class-transformer';
import {
  IsBooleanString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum NodeEnvironment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
  Test = 'test',
}

/**
 * Mirrors every variable defined in config/env/*.env. Kept in sync manually
 * with AppConfig/DatabaseConfig/AuthConfig/CacheConfig/StorageConfig/
 * AiConfig/SearchConfig/FeatureFlagsConfig so a missing or malformed env var
 * fails fast at startup instead of surfacing as a runtime error deep in a
 * request.
 */
class EnvironmentVariables {
  @IsIn(Object.values(NodeEnvironment))
  NODE_ENV!: NodeEnvironment;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT!: number;

  @IsString()
  APP_NAME!: string;

  @IsOptional()
  @IsString()
  APP_VERSION?: string;

  @IsString()
  API_PREFIX!: string;

  @IsString()
  CORS_ORIGIN!: string;

  @IsInt()
  THROTTLE_TTL!: number;

  @IsInt()
  THROTTLE_LIMIT!: number;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  JWT_SECRET!: string;

  @IsString()
  JWT_ACCESS_EXPIRES_IN!: string;

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN!: string;

  @IsOptional()
  @IsString()
  AUTH_REMEMBER_ME_EXPIRES_IN?: string;

  @IsOptional()
  @IsString()
  AUTH_PASSWORD_RESET_EXPIRES_IN?: string;

  @IsOptional()
  @IsString()
  AUTH_EMAIL_VERIFICATION_EXPIRES_IN?: string;

  @IsString()
  REDIS_URL!: string;

  @IsOptional()
  @IsString()
  CACHE_PROVIDER?: string;

  @IsString()
  STORAGE_PROVIDER!: string;

  @IsString()
  STORAGE_ENDPOINT!: string;

  @IsString()
  STORAGE_REGION!: string;

  @IsString()
  STORAGE_BUCKET!: string;

  @IsString()
  STORAGE_ACCESS_KEY_ID!: string;

  @IsString()
  STORAGE_SECRET_ACCESS_KEY!: string;

  @IsBooleanString()
  AI_ENABLED!: string;

  @IsOptional()
  @IsString()
  AI_PROVIDER?: string;

  @IsOptional()
  @IsString()
  AI_MODEL?: string;

  @IsOptional()
  @IsString()
  AI_API_KEY?: string;

  @IsOptional()
  @IsString()
  AI_BASE_URL?: string;

  @IsOptional()
  @IsInt()
  AI_TIMEOUT_MS?: number;

  @IsOptional()
  @IsNumber()
  AI_TEMPERATURE?: number;

  @IsOptional()
  @IsInt()
  AI_MAX_TOKENS?: number;

  @IsOptional()
  @IsInt()
  AI_RETRY_ATTEMPTS?: number;

  @IsBooleanString()
  SEARCH_ENABLED!: string;

  @IsOptional()
  @IsString()
  SEARCH_ENGINE?: string;

  @IsOptional()
  @IsString()
  SEARCH_HOST?: string;

  @IsOptional()
  @IsString()
  SEARCH_API_KEY?: string;

  @IsOptional()
  @IsInt()
  SEARCH_TIMEOUT_MS?: number;

  @IsBooleanString()
  FEATURE_AI_ENABLED!: string;

  @IsBooleanString()
  FEATURE_COMMENTS_ENABLED!: string;

  @IsBooleanString()
  FEATURE_RSS_ENABLED!: string;

  @IsBooleanString()
  FEATURE_SEARCH_ENABLED!: string;

  @IsBooleanString()
  FEATURE_ANALYTICS_ENABLED!: string;

  @IsBooleanString()
  FEATURE_MEDIA_ENABLED!: string;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const message = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Invalid environment configuration: ${message}`);
  }

  return validated;
}
