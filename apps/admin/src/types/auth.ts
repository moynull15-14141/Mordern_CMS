/**
 * Mirrors the backend's frozen Identity/Authorization contract exactly —
 * docs/37_IDENTITY_FREEZE.md, docs/38_RBAC_ARCHITECTURE.md,
 * docs/55_FRONTEND_HANDOFF.md "Authentication Flow" / "Permission Flow".
 */
/** Shape returned by GET /auth/me — identity fields only, never permissions
 * (those come from a separate call, see MyAuthorization below). */
export interface CurrentUser {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  status: string;
}

/**
 * Shape returned by POST /auth/login and POST /auth/refresh
 * (`AuthTokensDto`, `modules/identity/dto/auth-tokens.dto.ts`). `expiresIn`
 * is a duration STRING (e.g. `'15m'`), never a numeric seconds value — the
 * backend never converts it, so this type must not either (Frontend
 * Milestone 2 Conflict Report #1). `user` is the same shape as
 * `CurrentUser` and is already present on every login/refresh response —
 * AuthProvider seeds the `auth.me` query cache with it directly instead of
 * firing a redundant `GET /auth/me` right after login.
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  tokenType: string;
  user: CurrentUser;
}

/** Shape returned by GET /authorization/me (38_RBAC_ARCHITECTURE.md). */
export interface MyAuthorization {
  roles: string[];
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}
