/**
 * Themes module (Backend Milestone 12). `ThemeStatus` is the frozen
 * Prisma enum — used directly, never re-declared here. This file only
 * holds module-local, code-level vocabulary with no schema equivalent,
 * mirroring `menus/constants/menu.constants.ts`.
 */
export enum ThemeSortField {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  STATUS = 'status',
}

export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 200;
export const SLUG_MAX_UNIQUENESS_ATTEMPTS = 50;

/** `#fff` / `#ffffff`-style hex color, optional leading `#`-required
 * shape — the only "invented" validation rule this module adds, and only
 * because a color field with no shape check at all would accept garbage
 * a public site can't render; not a business rule, an input-shape one
 * (same class of check `SLUG_SHAPE_PATTERN` already is elsewhere). */
export const HEX_COLOR_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
