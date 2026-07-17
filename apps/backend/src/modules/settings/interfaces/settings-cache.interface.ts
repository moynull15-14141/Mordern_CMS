/**
 * Future cache tier for resolved settings (mirrors the pattern established by
 * `AuthorizationCacheProvider` in `38_RBAC_ARCHITECTURE.md`). Interface only
 * — no Redis, no in-memory implementation, and no DI provider is registered
 * for it in this milestone. `SettingsService` resolves every read from the
 * database today.
 */
export interface SettingsCacheInterface {
  get(cacheKey: string): Promise<string | undefined>;
  set(cacheKey: string, value: string, ttlSeconds?: number): Promise<void>;
  invalidate(cacheKey: string): Promise<void>;
  invalidateCategory(category: string): Promise<void>;
}
