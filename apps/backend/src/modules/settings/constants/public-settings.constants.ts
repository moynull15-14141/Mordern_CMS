import { SettingCategory } from '../enums/setting-category.enum';
import { buildSettingKey } from '../interfaces/setting-definition.interface';

/**
 * The closed allowlist of settings safe to expose on the Public Settings
 * API (Milestone 13.2) — reuses the real, existing `SETTING_DEFINITIONS`
 * registry (`../settings.constants.ts`) for every value; nothing here
 * hardcodes a value, only which keys are eligible. `PublicSettingsService`
 * additionally re-checks each definition's own `isHidden`/`isEncrypted`/
 * `type` metadata before including it — this list is necessary but not
 * sufficient (defense in depth).
 *
 * Deliberately excludes several keys the milestone brief names as
 * *examples* but that do not exist as real `Setting` definitions in this
 * codebase — see docs/75_BACKEND_PUBLIC_CONTENT_API.md "Known Limitations"
 * for the full reasoning per excluded example:
 * - `logo`/`favicon` — these live on `Theme`, not `Setting`
 *   (`ThemeSettingsDto.logo`/`.favicon`), already public via
 *   `GET /public/theme`. Inventing a duplicate `Setting` for them would
 *   create two conflicting sources of truth.
 * - `social links` — no such `Setting` definition, or any other field,
 *   exists anywhere in this codebase.
 * - `analytics.trackingId` — exists, but its own definition marks it
 *   `isHidden: true`; excluded per that flag rather than force-included
 *   just because the brief's example list mentioned "analytics ids".
 * - full "contact information" — only `general.adminEmail` exists; there
 *   is no phone/address/social-contact `Setting`.
 */
export const PUBLIC_SETTING_KEYS: readonly string[] = [
  buildSettingKey(SettingCategory.GENERAL, 'siteName'),
  buildSettingKey(SettingCategory.GENERAL, 'siteTagline'),
  buildSettingKey(SettingCategory.GENERAL, 'adminEmail'),
  buildSettingKey(SettingCategory.LOCALIZATION, 'defaultLocale'),
  buildSettingKey(SettingCategory.LOCALIZATION, 'timezone'),
  buildSettingKey(SettingCategory.SITE, 'maintenanceMode'),
];
