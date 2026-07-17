import { SettingCategory } from './enums/setting-category.enum';
import { SettingType } from './enums/setting-type.enum';
import { SettingDefinition, buildSettingKey } from './interfaces/setting-definition.interface';

/**
 * The complete static registry of every setting this milestone defines.
 * This is the ONLY place a new setting is declared — `SettingsService` never
 * accepts an arbitrary key that isn't listed here (Milestone 6 foundation is
 * closed-vocabulary by design, matching the `PERMISSIONS` constant pattern in
 * `38_RBAC_ARCHITECTURE.md`). Each entry's `category`+`key` maps directly
 * onto the frozen `Setting.namespace`/`Setting.key` columns — adding a
 * setting never requires a migration.
 *
 * FEATURE_FLAGS entries mirror the existing `FEATURE_*_ENABLED` env vars
 * (`apps/backend/src/config/feature-flags.config.ts`) via `envKey` so the
 * existing environment-driven behavior remains the fallback tier when no
 * database override exists — see docs/39_SETTINGS_ARCHITECTURE.md.
 */
export const SETTING_DEFINITIONS: readonly SettingDefinition[] = [
  // --- General ---
  {
    category: SettingCategory.GENERAL,
    key: 'siteName',
    type: SettingType.STRING,
    label: 'Site Name',
    description: 'The public display name of this installation.',
    defaultValue: 'Modern CMS',
    validation: { required: true, min: 1, max: 200 },
  },
  {
    category: SettingCategory.GENERAL,
    key: 'siteTagline',
    type: SettingType.STRING,
    label: 'Site Tagline',
    defaultValue: '',
    validation: { required: false, max: 300 },
  },
  {
    category: SettingCategory.GENERAL,
    key: 'adminEmail',
    type: SettingType.EMAIL,
    label: 'Administrator Email',
    defaultValue: '',
    validation: { required: false },
  },

  // --- Site ---
  {
    category: SettingCategory.SITE,
    key: 'homepageUrl',
    type: SettingType.URL,
    label: 'Homepage URL',
    defaultValue: '',
  },
  {
    category: SettingCategory.SITE,
    key: 'maintenanceMode',
    type: SettingType.BOOLEAN,
    label: 'Maintenance Mode',
    defaultValue: false,
  },
  {
    category: SettingCategory.SITE,
    key: 'primaryColor',
    type: SettingType.COLOR,
    label: 'Primary Brand Color',
    defaultValue: '#0f172a',
    validation: { regex: '^#[0-9a-fA-F]{6}$' },
  },

  // --- Localization ---
  {
    category: SettingCategory.LOCALIZATION,
    key: 'defaultLocale',
    type: SettingType.STRING,
    label: 'Default Locale',
    defaultValue: 'en',
    validation: { required: true, regex: '^[a-z]{2}(-[A-Z]{2})?$' },
  },
  {
    category: SettingCategory.LOCALIZATION,
    key: 'supportedLocales',
    type: SettingType.ARRAY,
    label: 'Supported Locales',
    defaultValue: ['en'],
  },
  {
    category: SettingCategory.LOCALIZATION,
    key: 'timezone',
    type: SettingType.STRING,
    label: 'Default Timezone',
    defaultValue: 'UTC',
  },

  // --- Security ---
  {
    category: SettingCategory.SECURITY,
    key: 'sessionTimeoutMinutes',
    type: SettingType.NUMBER,
    label: 'Session Timeout (minutes)',
    defaultValue: 60,
    validation: { min: 5, max: 1440 },
  },
  {
    category: SettingCategory.SECURITY,
    key: 'enforceHttps',
    type: SettingType.BOOLEAN,
    label: 'Enforce HTTPS',
    defaultValue: true,
    isReadOnly: true,
  },
  {
    category: SettingCategory.SECURITY,
    key: 'allowedCorsOrigins',
    type: SettingType.ARRAY,
    label: 'Allowed CORS Origins',
    defaultValue: [],
    envKey: 'CORS_ORIGIN',
  },

  // --- Authentication ---
  {
    category: SettingCategory.AUTHENTICATION,
    key: 'accessTokenExpiresIn',
    type: SettingType.STRING,
    label: 'Access Token Expiry',
    defaultValue: '15m',
    envKey: 'JWT_ACCESS_EXPIRES_IN',
    isReadOnly: true,
  },
  {
    category: SettingCategory.AUTHENTICATION,
    key: 'refreshTokenExpiresIn',
    type: SettingType.STRING,
    label: 'Refresh Token Expiry',
    defaultValue: '7d',
    envKey: 'JWT_REFRESH_EXPIRES_IN',
    isReadOnly: true,
  },
  {
    category: SettingCategory.AUTHENTICATION,
    key: 'passwordMinLength',
    type: SettingType.NUMBER,
    label: 'Minimum Password Length',
    defaultValue: 8,
    validation: { min: 8, max: 128 },
  },

  // --- Media ---
  {
    category: SettingCategory.MEDIA,
    key: 'maxUploadSizeMb',
    type: SettingType.NUMBER,
    label: 'Maximum Upload Size (MB)',
    defaultValue: 25,
    validation: { min: 1, max: 1024 },
  },
  {
    category: SettingCategory.MEDIA,
    key: 'allowedMimeTypes',
    type: SettingType.ARRAY,
    label: 'Allowed MIME Types',
    defaultValue: ['image/png', 'image/jpeg', 'image/webp'],
  },
  {
    category: SettingCategory.MEDIA,
    key: 'defaultFolder',
    type: SettingType.FILE_REFERENCE,
    label: 'Default Media Folder',
    defaultValue: null,
    validation: { nullable: true },
  },

  // --- SEO ---
  {
    category: SettingCategory.SEO,
    key: 'defaultMetaTitle',
    type: SettingType.STRING,
    label: 'Default Meta Title',
    defaultValue: '',
  },
  {
    category: SettingCategory.SEO,
    key: 'defaultMetaDescription',
    type: SettingType.TEXT,
    label: 'Default Meta Description',
    defaultValue: '',
  },
  {
    category: SettingCategory.SEO,
    key: 'robotsIndexing',
    type: SettingType.BOOLEAN,
    label: 'Allow Search Engine Indexing',
    defaultValue: true,
  },

  // --- Comments ---
  {
    category: SettingCategory.COMMENTS,
    key: 'requireModeration',
    type: SettingType.BOOLEAN,
    label: 'Require Comment Moderation',
    defaultValue: true,
  },
  {
    category: SettingCategory.COMMENTS,
    key: 'maxLength',
    type: SettingType.NUMBER,
    label: 'Maximum Comment Length',
    defaultValue: 2000,
    validation: { min: 1, max: 10000 },
  },

  // --- Analytics ---
  {
    category: SettingCategory.ANALYTICS,
    key: 'trackingId',
    type: SettingType.STRING,
    label: 'Analytics Tracking ID',
    defaultValue: '',
    isHidden: true,
  },
  {
    category: SettingCategory.ANALYTICS,
    key: 'anonymizeIp',
    type: SettingType.BOOLEAN,
    label: 'Anonymize Visitor IP',
    defaultValue: true,
  },

  // --- Email ---
  {
    category: SettingCategory.EMAIL,
    key: 'fromAddress',
    type: SettingType.EMAIL,
    label: 'Default "From" Address',
    defaultValue: '',
  },
  {
    category: SettingCategory.EMAIL,
    key: 'providerApiKey',
    type: SettingType.SECRET,
    label: 'Email Provider API Key',
    defaultValue: '',
    isEncrypted: true,
    isHidden: true,
  },

  // --- Storage ---
  {
    category: SettingCategory.STORAGE,
    key: 'provider',
    type: SettingType.STRING,
    label: 'Storage Provider',
    defaultValue: 'REPLACE_ME_STORAGE_PROVIDER',
    envKey: 'STORAGE_PROVIDER',
    isReadOnly: true,
  },
  {
    category: SettingCategory.STORAGE,
    key: 'bucket',
    type: SettingType.STRING,
    label: 'Storage Bucket',
    defaultValue: '',
    envKey: 'STORAGE_BUCKET',
    isReadOnly: true,
  },
  {
    category: SettingCategory.STORAGE,
    key: 'secretAccessKey',
    type: SettingType.SECRET,
    label: 'Storage Secret Access Key',
    defaultValue: '',
    envKey: 'STORAGE_SECRET_ACCESS_KEY',
    isEncrypted: true,
    isHidden: true,
    isReadOnly: true,
  },

  // --- Search ---
  {
    category: SettingCategory.SEARCH,
    key: 'enabled',
    type: SettingType.BOOLEAN,
    label: 'Search Enabled',
    defaultValue: false,
    envKey: 'SEARCH_ENABLED',
  },
  {
    category: SettingCategory.SEARCH,
    key: 'engine',
    type: SettingType.STRING,
    label: 'Search Engine',
    defaultValue: 'database',
    envKey: 'SEARCH_ENGINE',
    validation: { allowedValues: ['database', 'elasticsearch', 'meilisearch', 'typesense'] },
  },

  // --- AI (must remain disabled by default; see docs/40_PRODUCT_PHILOSOPHY.md AI Roadmap) ---
  {
    category: SettingCategory.AI,
    key: 'enabled',
    type: SettingType.BOOLEAN,
    label: 'AI Enabled',
    description: 'Master switch. The CMS is 100% usable with this disabled.',
    defaultValue: false,
    envKey: 'AI_ENABLED',
  },
  {
    category: SettingCategory.AI,
    key: 'provider',
    type: SettingType.STRING,
    label: 'AI Provider',
    defaultValue: 'openai',
    envKey: 'AI_PROVIDER',
    validation: { allowedValues: ['openai', 'gemini', 'claude', 'openrouter', 'ollama', 'custom'] },
  },
  {
    category: SettingCategory.AI,
    key: 'apiKey',
    type: SettingType.SECRET,
    label: 'AI Provider API Key',
    defaultValue: '',
    envKey: 'AI_API_KEY',
    isEncrypted: true,
    isHidden: true,
  },

  // --- Performance ---
  {
    category: SettingCategory.PERFORMANCE,
    key: 'throttleTtlSeconds',
    type: SettingType.NUMBER,
    label: 'Rate Limit Window (seconds)',
    defaultValue: 60,
    envKey: 'THROTTLE_TTL',
    validation: { min: 1 },
  },
  {
    category: SettingCategory.PERFORMANCE,
    key: 'throttleLimit',
    type: SettingType.NUMBER,
    label: 'Rate Limit Max Requests',
    defaultValue: 100,
    envKey: 'THROTTLE_LIMIT',
    validation: { min: 1 },
  },

  // --- Feature Flags (moved here per Milestone 6; see docs/39_SETTINGS_ARCHITECTURE.md) ---
  {
    category: SettingCategory.FEATURE_FLAGS,
    key: 'ai',
    type: SettingType.BOOLEAN,
    label: 'Feature: AI',
    defaultValue: false,
    envKey: 'FEATURE_AI_ENABLED',
  },
  {
    category: SettingCategory.FEATURE_FLAGS,
    key: 'comments',
    type: SettingType.BOOLEAN,
    label: 'Feature: Comments',
    defaultValue: true,
    envKey: 'FEATURE_COMMENTS_ENABLED',
  },
  {
    category: SettingCategory.FEATURE_FLAGS,
    key: 'rss',
    type: SettingType.BOOLEAN,
    label: 'Feature: RSS',
    defaultValue: true,
    envKey: 'FEATURE_RSS_ENABLED',
  },
  {
    category: SettingCategory.FEATURE_FLAGS,
    key: 'search',
    type: SettingType.BOOLEAN,
    label: 'Feature: Search',
    defaultValue: true,
    envKey: 'FEATURE_SEARCH_ENABLED',
  },
  {
    category: SettingCategory.FEATURE_FLAGS,
    key: 'analytics',
    type: SettingType.BOOLEAN,
    label: 'Feature: Analytics',
    defaultValue: false,
    envKey: 'FEATURE_ANALYTICS_ENABLED',
  },
  {
    category: SettingCategory.FEATURE_FLAGS,
    key: 'media',
    type: SettingType.BOOLEAN,
    label: 'Feature: Media',
    defaultValue: true,
    envKey: 'FEATURE_MEDIA_ENABLED',
  },

  // --- System ---
  {
    category: SettingCategory.SYSTEM,
    key: 'appVersion',
    type: SettingType.STRING,
    label: 'Application Version',
    defaultValue: '0.1.0',
    envKey: 'APP_VERSION',
    isReadOnly: true,
  },
  {
    category: SettingCategory.SYSTEM,
    key: 'apiPrefix',
    type: SettingType.STRING,
    label: 'API Prefix',
    defaultValue: 'api/v1',
    envKey: 'API_PREFIX',
    isReadOnly: true,
  },

  // --- Developer ---
  {
    category: SettingCategory.DEVELOPER,
    key: 'debugMode',
    type: SettingType.BOOLEAN,
    label: 'Debug Mode',
    defaultValue: false,
  },
  {
    category: SettingCategory.DEVELOPER,
    key: 'swaggerEnabled',
    type: SettingType.BOOLEAN,
    label: 'Swagger Docs Enabled',
    defaultValue: true,
    isReadOnly: true,
  },
] as const;

/** O(1) lookup map keyed by the dotted `category.key` identity — built once
 * at module load, never mutated. */
export const SETTING_DEFINITION_MAP: ReadonlyMap<string, SettingDefinition> = new Map(
  SETTING_DEFINITIONS.map((definition) => [
    buildSettingKey(definition.category, definition.key),
    definition,
  ])
);

export function getSettingDefinitions(category?: SettingCategory): readonly SettingDefinition[] {
  if (!category) {
    return SETTING_DEFINITIONS;
  }
  return SETTING_DEFINITIONS.filter((definition) => definition.category === category);
}
