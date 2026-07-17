/**
 * Frozen category vocabulary for Milestone 6. A category maps 1:1 onto the
 * existing `Setting.namespace` column (`36_DATABASE_FREEZE.md`) — no schema
 * change. Adding a category means adding an enum member here and a matching
 * section in `SETTING_DEFINITIONS`, never hand-writing a namespace string.
 */
export enum SettingCategory {
  GENERAL = 'general',
  SITE = 'site',
  LOCALIZATION = 'localization',
  SECURITY = 'security',
  AUTHENTICATION = 'authentication',
  MEDIA = 'media',
  SEO = 'seo',
  COMMENTS = 'comments',
  ANALYTICS = 'analytics',
  EMAIL = 'email',
  STORAGE = 'storage',
  SEARCH = 'search',
  AI = 'ai',
  PERFORMANCE = 'performance',
  FEATURE_FLAGS = 'feature_flags',
  SYSTEM = 'system',
  DEVELOPER = 'developer',
}
