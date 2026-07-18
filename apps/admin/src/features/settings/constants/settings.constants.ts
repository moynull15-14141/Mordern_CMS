import type { SettingCategory, SettingType } from '../types/settings';

/**
 * Display-only labels — `SettingResponseDto` never returns a human category
 * label (only the enum value, e.g. `"feature_flags"`), so this mapping is
 * purely presentational, not a duplication of any backend business rule.
 * All 17 values verified against `enums/setting-category.enum.ts`.
 */
export const SETTING_CATEGORY_LABELS: Record<SettingCategory, string> = {
  general: 'General',
  site: 'Site',
  localization: 'Localization',
  security: 'Security',
  authentication: 'Authentication',
  media: 'Media',
  seo: 'SEO',
  comments: 'Comments',
  analytics: 'Analytics',
  email: 'Email',
  storage: 'Storage',
  search: 'Search',
  ai: 'AI',
  performance: 'Performance',
  feature_flags: 'Feature Flags',
  system: 'System',
  developer: 'Developer',
};

export const SETTING_CATEGORY_OPTIONS: { value: SettingCategory; label: string }[] = (
  Object.keys(SETTING_CATEGORY_LABELS) as SettingCategory[]
).map((value) => ({ value, label: SETTING_CATEGORY_LABELS[value] }));

/** `SettingValueSource` display labels — `dto/setting-response.dto.ts`. */
export const SETTING_SOURCE_LABELS: Record<string, string> = {
  RUNTIME_OVERRIDE: 'Runtime override',
  ENVIRONMENT: 'Environment variable',
  DATABASE: 'Database',
  DEFAULT: 'System default',
};

/** Types whose value is redacted (`null`) on every read except the direct
 * response to that setting's own update — `SENSITIVE_SETTING_TYPES`
 * (`enums/setting-type.enum.ts`), mirrored here as a plain value list since
 * it's a fixed, frozen set. */
export const SENSITIVE_SETTING_TYPES: ReadonlySet<SettingType> = new Set(['PASSWORD', 'SECRET']);
