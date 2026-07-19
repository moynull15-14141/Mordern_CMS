/**
 * Mirrors `PublicSettingResponseDto`
 * (`apps/backend/src/modules/settings/dto/public-setting-response.dto.ts`)
 * field-for-field — the real, live response shape of `GET /public/settings`.
 * The backend returns an array of exactly the allowlisted keys in
 * `PUBLIC_SETTING_KEYS` (currently `general.siteName`, `general.siteTagline`,
 * `general.adminEmail`, `localization.defaultLocale`,
 * `localization.timezone`, `site.maintenanceMode`) — no other key is ever
 * present, and none is guaranteed present if a future backend change
 * narrows the allowlist, so callers must look up by key defensively (see
 * `utils/settings-lookup.util.ts`).
 */
export interface PublicSetting {
  key: string;
  label: string;
  value: unknown;
}
