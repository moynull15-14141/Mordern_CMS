/**
 * Menus module (Backend Milestone 11.2). `MenuStatus`/`MenuItemTargetType`/
 * `MenuItemOpenMode` are the frozen Prisma enums introduced in Backend
 * Milestone 11.1 — used directly, never re-declared here. This file only
 * holds module-local, code-level vocabulary with no schema equivalent,
 * mirroring `articles/constants/article.constants.ts`.
 */
export enum MenuSortField {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  STATUS = 'status',
}

export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 200;
export const SLUG_MAX_UNIQUENESS_ATTEMPTS = 50;
