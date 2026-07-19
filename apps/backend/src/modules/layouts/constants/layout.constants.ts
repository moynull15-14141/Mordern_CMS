/**
 * Layout Engine module (Backend Milestone 14.1). `LayoutStatus` is the
 * frozen Prisma enum — used directly, never re-declared here. This file
 * only holds module-local, code-level vocabulary with no schema
 * equivalent, mirroring `themes/constants/theme.constants.ts`.
 */
export enum LayoutSortField {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  STATUS = 'status',
}

export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 200;
export const SLUG_MAX_UNIQUENESS_ATTEMPTS = 50;

/**
 * The layout presets the frontend Theme Rendering System actually
 * implements (`apps/web/src/features/public/theme-renderer/utils/layout-preset.types.ts`'s
 * `LAYOUT_PRESET_NAMES`, Milestone 13.4) — mirrored here by hand (no
 * shared package is wired between `apps/web` and `apps/backend` anywhere
 * in this codebase; every other cross-app contract in this project is
 * kept in sync the same manual way, e.g. `PublicTheme` mirroring
 * `PublicThemeResponseDto`).
 *
 * `Layout.layoutPreset` stays a plain `String` column (not a Prisma enum)
 * so a new preset can ship on the frontend without a migration — same
 * reasoning `ThemeSettingsDto.homepageLayout`/`.headerLayout` already
 * establish. This list is used only for a shape-validation warning at the
 * DTO layer (`LayoutsValidator.validateLayoutPreset`), never a hard
 * database constraint — an unrecognized value is still accepted (a future
 * frontend release may add a preset before this list is updated), it just
 * cannot silently typo past validation unnoticed in tests.
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

export function isKnownLayoutPreset(value: string): value is LayoutPresetName {
  return (LAYOUT_PRESET_NAMES as readonly string[]).includes(value);
}
