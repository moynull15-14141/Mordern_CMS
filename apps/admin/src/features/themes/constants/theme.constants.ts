import type { ThemeSortField, ThemeStatus } from '../types/theme';

export const THEMES_DEFAULT_PAGE_SIZE = 20;

/** All 3 real `ThemeStatus` values — display label only, verified against
 * the backend's frozen enum. */
export const STATUS_LABELS: Record<ThemeStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

export const STATUS_OPTIONS: { value: ThemeStatus; label: string }[] = (
  Object.keys(STATUS_LABELS) as ThemeStatus[]
).map((value) => ({ value, label: STATUS_LABELS[value] }));

export const STATUS_BADGE_VARIANT: Record<
  ThemeStatus,
  'success' | 'secondary' | 'warning' | 'info' | 'outline' | 'destructive'
> = {
  DRAFT: 'secondary',
  PUBLISHED: 'success',
  ARCHIVED: 'outline',
};

export const SORT_FIELD_LABELS: Record<ThemeSortField, string> = {
  name: 'Name',
  createdAt: 'Created',
  updatedAt: 'Updated',
  status: 'Status',
};
