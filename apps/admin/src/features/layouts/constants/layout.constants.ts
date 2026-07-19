import type { LayoutPresetName, LayoutSortField, LayoutStatus } from '../types/layout';
import { LAYOUT_PRESET_NAMES } from '../types/layout';

export const LAYOUTS_DEFAULT_PAGE_SIZE = 20;

/** All 3 real `LayoutStatus` values — display label only, verified against
 * the backend's frozen enum. */
export const STATUS_LABELS: Record<LayoutStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

export const STATUS_OPTIONS: { value: LayoutStatus; label: string }[] = (
  Object.keys(STATUS_LABELS) as LayoutStatus[]
).map((value) => ({ value, label: STATUS_LABELS[value] }));

export const STATUS_BADGE_VARIANT: Record<
  LayoutStatus,
  'success' | 'secondary' | 'warning' | 'info' | 'outline' | 'destructive'
> = {
  DRAFT: 'secondary',
  PUBLISHED: 'success',
  ARCHIVED: 'outline',
};

export const SORT_FIELD_LABELS: Record<LayoutSortField, string> = {
  name: 'Name',
  createdAt: 'Created',
  updatedAt: 'Updated',
  status: 'Status',
};

/** Display labels for the 7 real registered presets — see
 * `types/layout.ts`'s `LAYOUT_PRESET_NAMES` doc comment. */
export const PRESET_LABELS: Record<LayoutPresetName, string> = {
  default: 'Default',
  'full-width': 'Full Width',
  boxed: 'Boxed',
  centered: 'Centered',
  'sidebar-left': 'Sidebar Left',
  'sidebar-right': 'Sidebar Right',
  'no-sidebar': 'No Sidebar',
};

export const PRESET_OPTIONS: { value: LayoutPresetName; label: string }[] = LAYOUT_PRESET_NAMES.map(
  (value) => ({ value, label: PRESET_LABELS[value] })
);
