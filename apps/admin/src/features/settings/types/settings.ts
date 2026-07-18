/**
 * Mirrors `apps/backend/src/modules/settings/{enums,dto,interfaces}/*.ts`
 * 1:1 — verified against the real source, not assumed
 * (docs/59_FRONTEND_CODING_GUIDELINES.md "Types mirror backend DTOs 1:1").
 */

/** `SettingCategory` enum — 17 frozen categories,
 * `enums/setting-category.enum.ts`. */
export type SettingCategory =
  | 'general'
  | 'site'
  | 'localization'
  | 'security'
  | 'authentication'
  | 'media'
  | 'seo'
  | 'comments'
  | 'analytics'
  | 'email'
  | 'storage'
  | 'search'
  | 'ai'
  | 'performance'
  | 'feature_flags'
  | 'system'
  | 'developer';

/** `SettingType` enum — `enums/setting-type.enum.ts`. */
export type SettingType =
  | 'STRING'
  | 'TEXT'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'JSON'
  | 'ARRAY'
  | 'COLOR'
  | 'URL'
  | 'EMAIL'
  | 'PASSWORD'
  | 'SECRET'
  | 'FILE_REFERENCE';

/** `SettingValueSource` enum — `dto/setting-response.dto.ts`. Where the
 * currently-resolved value came from in the frozen priority chain. */
export type SettingValueSource = 'RUNTIME_OVERRIDE' | 'ENVIRONMENT' | 'DATABASE' | 'DEFAULT';

/** JSON-compatible value a setting may hold — `interfaces/setting-value.type.ts`. */
export type SettingValue = string | number | boolean | null | SettingValue[] | { [key: string]: SettingValue };

/** `SettingResponseDto` — the shape every GET/PUT settings response
 * returns. `value` is `null` for PASSWORD/SECRET/`isEncrypted` settings on
 * every read UNLESS it's the direct response to that same setting's own
 * update call (docs/64_FRONTEND_SETTINGS.md "Sensitive Values"). */
export interface Setting {
  key: string;
  category: SettingCategory;
  type: SettingType;
  label: string;
  description?: string;
  value: SettingValue;
  source: SettingValueSource;
  isReadOnly: boolean;
  isHidden: boolean;
  isEncrypted: boolean;
}

/** `UpdateSettingDto` — `PUT /settings/:key`. */
export interface UpdateSettingInput {
  value: SettingValue;
}

/** `SettingEntryDto` — one entry inside `BulkUpdateSettingsDto`. `key` is
 * unqualified by category (the category comes from the route). */
export interface SettingEntry {
  key: string;
  value: SettingValue;
}

/** `BulkUpdateSettingsDto` — `PUT /settings/category/:category`. */
export interface BulkUpdateInput {
  settings: SettingEntry[];
}

/** `ResetResultDto` — `POST /settings/reset` and `/settings/reset/category`. */
export interface ResetResult {
  resetCount: number;
}
