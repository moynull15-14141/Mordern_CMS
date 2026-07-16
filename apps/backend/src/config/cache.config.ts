import { registerAs } from '@nestjs/config';

export const cacheConfig = registerAs('cache', () => ({
  redisUrl: process.env.REDIS_URL,
  provider: process.env.CACHE_PROVIDER ?? 'redis',
}));
