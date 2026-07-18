/** Public surface for the Settings feature — docs/58_FRONTEND_FOLDER_STRUCTURE.md
 * "Feature public surface": only what `app/` actually needs. */
export { SettingsPageContent } from './components/settings-page-content';
export { CategorySettingsPageContent } from './components/category-settings-page-content';

export { SettingsTable } from './components/settings-table';
export { SettingsFilters } from './components/settings-filters';
export { SettingField } from './components/setting-field';
export { SettingValueDisplay } from './components/setting-value-display';
export { CategorySettingsForm } from './components/category-settings-form';
export { SettingDetailsDialog } from './components/setting-details-dialog';
export { ResetCategoryDialog } from './components/reset-category-dialog';
export { ResetAllDialog } from './components/reset-all-dialog';

export {
  SETTING_CATEGORY_LABELS,
  SETTING_CATEGORY_OPTIONS,
  SETTING_SOURCE_LABELS,
  SENSITIVE_SETTING_TYPES,
} from './constants/settings.constants';

export { useSettings } from './hooks/use-settings';
export { useSettingsByCategory } from './hooks/use-settings-by-category';
export { useSetting } from './hooks/use-setting';
export { useUpdateSetting } from './hooks/use-update-setting';
export { useBulkUpdateCategory } from './hooks/use-bulk-update-category';
export { useResetCategory } from './hooks/use-reset-category';
export { useResetAll } from './hooks/use-reset-all';

export type {
  Setting,
  SettingCategory,
  SettingType,
  SettingValueSource,
  SettingValue,
  UpdateSettingInput,
  SettingEntry,
  BulkUpdateInput,
  ResetResult,
} from './types/settings';
