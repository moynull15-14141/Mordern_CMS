/** Public surface for the Themes feature — docs/58_FRONTEND_FOLDER_STRUCTURE.md
 * "Feature public surface": only what `app/` actually needs. */
export { ThemeTable } from './components/theme-table';
export { ThemeFilters, type ThemeFiltersValue } from './components/theme-filters';
export { CreateThemeForm, EditThemeForm } from './components/theme-form';
export { StatusBadge } from './components/status-badge';
export { ActiveBadge } from './components/active-badge';
export { DeleteDialog } from './components/delete-dialog';
export { RestoreDialog } from './components/restore-dialog';
export { ActivateDialog } from './components/activate-dialog';
export { ThemePreview } from './components/theme-preview';

// Page-level compositions — the only things `app/` actually imports.
export { ThemesPageContent } from './components/themes-page-content';
export { CreateThemePageContent } from './components/create-theme-page-content';
export { ThemeDetailPageContent } from './components/theme-detail-page-content';
export { EditThemePageContent } from './components/edit-theme-page-content';

export { useThemes } from './hooks/use-themes';
export { useTheme } from './hooks/use-theme';
export { useActiveTheme } from './hooks/use-active-theme';
export { useCreateTheme } from './hooks/use-create-theme';
export { useUpdateTheme } from './hooks/use-update-theme';
export { useDeleteTheme } from './hooks/use-delete-theme';
export { useRestoreTheme } from './hooks/use-restore-theme';
export { useActivateTheme } from './hooks/use-activate-theme';

export type {
  Theme,
  ThemeFilters as ThemeFiltersType,
  ThemeStatus,
  ThemeSettings,
  CreateThemeInput,
  UpdateThemeInput,
} from './types/theme';
