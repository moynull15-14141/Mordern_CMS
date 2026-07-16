import { Provider } from './provider.interface';

export enum CacheProviderType {
  MEMORY = 'memory',
  REDIS = 'redis',
}

/**
 * Interface only — no in-memory or Redis implementation exists yet. Wiring a
 * concrete adapter is part of a later milestone once a real caching need
 * (rate-limit counters, query caching, etc.) is implemented.
 */
export interface CacheProvider extends Provider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
}
