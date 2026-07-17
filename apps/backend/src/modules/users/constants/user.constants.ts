/**
 * User Management foundation (Milestone 7). `ProfileVisibility`/`ThemePreference`
 * are code-level vocabularies for values stored inside `User.metadata` JSON
 * (see interfaces/user-metadata.interface.ts) — they are NOT Prisma enums,
 * since the frozen schema has no columns for profile/preferences.
 */
export enum ProfileVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  TEAM = 'TEAM',
}

export enum ThemePreference {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  SYSTEM = 'SYSTEM',
}

export enum UserSortField {
  NAME = 'name',
  EMAIL = 'email',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  LAST_LOGIN = 'lastLoginAt',
  STATUS = 'status',
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** Reason strings passed to Identity's RefreshTokenRepository.revoke() /
 * revokeAllForUser() — kept centralized so call sites stay consistent. */
export const SESSION_REVOKE_REASON = {
  PASSWORD_CHANGE: 'password_change',
  ADMIN_RESET: 'admin_password_reset',
  FORCE_LOGOUT: 'force_logout',
  ADMIN_TERMINATE: 'admin_terminate_session',
  SELF_TERMINATE: 'self_terminate_session',
  USER_LOCKED: 'user_locked',
} as const;
