import type { PublicSetting } from '../types/settings.types';

/**
 * Looks up one value out of `GET /public/settings`'s array response by its
 * dotted `category.key` identity (e.g. `"general.siteName"`). The backend
 * only ever returns the closed `PUBLIC_SETTING_KEYS` allowlist
 * (`docs/75_BACKEND_PUBLIC_CONTENT_API.md`), so a requested key may
 * legitimately be absent (a future allowlist narrowing, or `settings` being
 * `null` from a fetch failure — see `load-render-context.ts`) — this
 * returns `undefined` rather than throwing either way.
 */
export function findSettingValue<T = unknown>(
  settings: PublicSetting[] | null,
  key: string
): T | undefined {
  return settings?.find((setting) => setting.key === key)?.value as T | undefined;
}
