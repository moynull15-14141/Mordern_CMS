/**
 * Category & Tag Foundation (Milestone 9). `CategoryStatus` is the frozen
 * Prisma enum (`36_DATABASE_FREEZE.md`, ACTIVE|INACTIVE only) — used
 * directly, never re-declared here.
 */
export enum CategorySortField {
  NAME = 'name',
  SLUG = 'slug',
  SORT_ORDER = 'sortOrder',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export enum TagSortField {
  NAME = 'name',
  SLUG = 'slug',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export const SLUG_MIN_LENGTH = 2;
export const SLUG_MAX_LENGTH = 200;
export const SLUG_MAX_UNIQUENESS_ATTEMPTS = 50;
