/** Mirrors the real backend `LayoutStatus` enum exactly
 * (`apps/backend/src/modules/layouts`, Backend Milestone 14.1). */
export type LayoutStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type LayoutSortField = 'name' | 'createdAt' | 'updatedAt' | 'status';

/**
 * The 7 layout presets the public site's Theme Rendering System
 * (`apps/web/src/features/public/theme-renderer`, Milestone 13.4) actually
 * has a registered component for — mirrored here by hand, same "no shared
 * package between apps/admin and apps/web" reasoning
 * `apps/backend/src/modules/layouts/constants/layout.constants.ts`'s own
 * `LAYOUT_PRESET_NAMES` documents. The backend field itself is a plain,
 * open-ended `String` (never rejects an unrecognized value) — this list is
 * only what the admin form offers as a dropdown.
 */
export const LAYOUT_PRESET_NAMES = [
  'default',
  'full-width',
  'boxed',
  'centered',
  'sidebar-left',
  'sidebar-right',
  'no-sidebar',
] as const;

export type LayoutPresetName = (typeof LAYOUT_PRESET_NAMES)[number];

export interface Layout {
  id: string;
  name: string;
  slug: string;
  status: LayoutStatus;
  layoutPreset: string;
  themeId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface LayoutFilters {
  page?: number;
  limit?: number;
  status?: LayoutStatus;
  themeId?: string;
  search?: string;
  sortBy?: LayoutSortField;
  sortOrder?: 'asc' | 'desc';
}

/** `CreateLayoutDto` 1:1 — no `status` field; every created layout starts
 * DRAFT server-side, same as Themes/Pages/Articles. No blocks/content
 * field — a Layout is structural only. */
export interface CreateLayoutInput {
  name: string;
  slug?: string;
  layoutPreset: string;
  themeId?: string;
}

/** `UpdateLayoutDto` 1:1 (PATCH semantics — every field optional). */
export interface UpdateLayoutInput {
  name?: string;
  slug?: string;
  layoutPreset?: string;
  themeId?: string | null;
  status?: LayoutStatus;
}
