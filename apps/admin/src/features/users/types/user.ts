/**
 * Mirrors `apps/backend/src/modules/users/dto/*.ts` and
 * `apps/backend/src/modules/users/interfaces/*.ts` 1:1 — verified against
 * the real source, not assumed from docs (docs/59_FRONTEND_CODING_GUIDELINES.md
 * "Types mirror backend DTOs 1:1, never invent extra fields"). No `roles`/
 * `permissions` field exists here because `UserResponseDto` doesn't return
 * one — see docs/63_FRONTEND_USERS.md "API Mapping".
 */

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export type ProfileVisibility = 'PUBLIC' | 'PRIVATE' | 'TEAM';

export type ThemePreference = 'LIGHT' | 'DARK' | 'SYSTEM';

/** Stored at `User.metadata.profile` — `interfaces/user-profile.interface.ts`. */
export interface UserProfile {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  bio?: string | null;
  website?: string | null;
  timezone?: string | null;
  language?: string | null;
  country?: string | null;
  city?: string | null;
  dateFormat?: string | null;
  timeFormat?: string | null;
  profileVisibility?: ProfileVisibility;
}

export interface NotificationPreference {
  email?: boolean;
  inApp?: boolean;
}

/** Stored at `User.metadata.preferences` — `interfaces/user-preferences.interface.ts`. */
export interface UserPreferences {
  theme?: ThemePreference;
  language?: string;
  timezone?: string;
  editorPreference?: Record<string, unknown>;
  dashboardPreference?: Record<string, unknown>;
  notificationPreference?: NotificationPreference;
  accessibilityPreference?: Record<string, unknown>;
}

/** `UserResponseDto` — the shape every GET/PATCH/POST users response
 * returns. No `roles`/`permissions` field — the backend does not return
 * one (see docs/63_FRONTEND_USERS.md). */
export interface User {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  status: UserStatus;
  profileImageId: string | null;
  lastLoginAt: string | null;
  locked: boolean;
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** `SessionResponseDto` — no `isCurrent`/matching field exists on the
 * backend (see docs/63_FRONTEND_USERS.md "Sessions" limitation). */
export interface UserSession {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceName: string | null;
  browser: string | null;
  operatingSystem: string | null;
  country: string | null;
  city: string | null;
  rememberMe: boolean;
  lastSeenAt: string;
  expiresAt: string;
  revokedAt: string | null;
}

/** `CreateUserDto` — no `status`/`role` field exists; a created user is
 * always `PENDING` (Prisma default), non-configurable at creation. */
export interface CreateUserInput {
  email: string;
  username?: string;
  displayName?: string;
  password?: string;
}

/** `UpdateUserDto` — identity fields only. No `status`/`role` field. */
export interface UpdateUserInput {
  username?: string;
  displayName?: string;
}

/** `UpdateProfileDto` — PATCH semantics, merged into `metadata.profile`. */
export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  website?: string;
  timezone?: string;
  language?: string;
  country?: string;
  city?: string;
  dateFormat?: string;
  timeFormat?: string;
  profileVisibility?: ProfileVisibility;
}

/** `UpdatePreferencesDto` — PATCH semantics, merged into `metadata.preferences`. */
export interface UpdatePreferencesInput {
  theme?: ThemePreference;
  language?: string;
  timezone?: string;
  editorPreference?: Record<string, unknown>;
  dashboardPreference?: Record<string, unknown>;
  notificationPreference?: NotificationPreference;
  accessibilityPreference?: Record<string, unknown>;
}

/** `ChangePasswordDto` — self-service; `POST /users/:id/change-password`
 * with `id` equal to the caller's own id. */
export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

/** `AdminResetPasswordDto` — `POST /users/:id/reset-password`, no current
 * password (requires `users.manage`). */
export interface AdminResetPasswordInput {
  newPassword: string;
}

/** `UserSortField` (backend enum, `constants/user.constants.ts`). */
export type UserSortField = 'name' | 'email' | 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'status';

export type SortOrder = 'asc' | 'desc';

/** `UserQueryDto` — filters recognized by `GET /users`. `role` is a
 * free-text match against a role NAME (no role list/display capability
 * exists — see docs/63_FRONTEND_USERS.md). */
export interface UserFilters {
  email?: string;
  username?: string;
  displayName?: string;
  role?: string;
  status?: UserStatus;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  search?: string;
  sortBy?: UserSortField;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}
