/**
 * Foundation only (Milestone 5, §Permission Cache) — interface, no Redis,
 * no in-memory cache, no implementation, no DI binding. Every
 * `AuthorizationService` call re-queries the database today. A future
 * implementation would cache `resolvePermissions()`/`resolveEffectiveRoles()`
 * results per user, invalidated on role/permission changes.
 */
export interface AuthorizationCacheProvider {
  get(key: string): Promise<string[] | null>;
  set(key: string, value: string[], ttlSeconds?: number): Promise<void>;
  invalidate(key: string): Promise<void>;
}
