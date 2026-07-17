# 42_USER_MANAGEMENT_ARCHITECTURE

## Executive Summary

User Management Foundation (Milestone 7). Mirrors `37_IDENTITY_FREEZE.md`/`38_RBAC_ARCHITECTURE.md`/`39_SETTINGS_ARCHITECTURE.md`'s role for their modules: from this point forward, `apps/backend/src/modules/users/` is the literal implementation of what this document describes. **Foundation only** — no frontend, no Admin UI, no AI, no live email/storage/search provider, no OAuth/MFA/social login, no multi-tenant/SaaS behavior, no Role/Permission CRUD, no Organization module.

Identity (Milestone 4), Authorization/RBAC (Milestone 5), and Settings (Milestone 6) already existed; this module is the first to actually use all three together — it owns full `User` CRUD, delegates every auth-adjacent concern (hashing, sessions, tokens) to Identity, and is gated by Authorization's existing `users.manage` permission.

**Architecture Status at time of writing: awaiting approval** (implementation complete and verified; not FROZEN the way Milestones 3–5 are).

## Folder Structure

```
users/
├── controllers/   — UsersController (all endpoints below)
├── services/      — UsersService (the single orchestrator)
├── repositories/  — UsersRepository (full User CRUD), UserSessionsRepository (read-only Session queries)
├── validators/    — UsersValidator (profile/preferences business rules beyond class-validator)
├── mappers/       — UsersMapper (User + metadata -> response DTOs)
├── dto/           — request/response contracts (11 files)
├── interfaces/    — UserProfile, UserPreferences, UserMetadata, UserQueryFilters/Options
├── constants/     — ProfileVisibility, ThemePreference, UserSortField, session-revoke reason strings
├── exceptions/    — UserNotFoundException and 6 others
└── users.module.ts
```

## Why No New Columns ("metadata" Strategy)

The frozen `User` model (`config/prisma/schema.prisma`, Milestone 3) has: `id, tenantId, siteId, email, username, displayName, passwordHash, status, profileImageId, lastLoginAt, metadata: Json?` + audit sextuple. **None** of `firstName`, `lastName`, `phone`, `bio`, `website`, `timezone`, `language`, `country`, `city`, `dateFormat`, `timeFormat`, `profileVisibility`, `theme`, `editorPreference`, `dashboardPreference`, `notificationPreference`, or `accessibilityPreference` exist as columns, and none are documented anywhere in `docs/41_PLATFORM_CAPABILITIES.md` either. Exactly as Milestone 6 did for Settings, this milestone stores all of it as structured JSON inside the existing `User.metadata: Json?` column:

```
User.metadata = {
  profile?: UserProfile,        // firstName, lastName, phone, bio, website, timezone, language, country, city, dateFormat, timeFormat, profileVisibility
  preferences?: UserPreferences,// theme, language, timezone, editorPreference, dashboardPreference, notificationPreference, accessibilityPreference
  security?: UserSecurityMetadata, // locked, lockedAt, lockedReason, lockedBy — see "User Status Conflict" below
}
```

No migration. `firstName`/`lastName`/`username`/`displayName` deliberately don't collapse into one field: `username` and `displayName` are real columns (used as-is); `firstName`/`lastName` are profile-only JSON fields distinct from `displayName`.

## User Status Conflict (Reported, Not Silently Resolved)

The frozen `UserStatus` enum (schema.prisma) has exactly four values: `ACTIVE | INACTIVE | SUSPENDED | PENDING`. The milestone brief's own "USER STATUS" section lists six — including `LOCKED` and `DELETED` — while also instructing "Respect the frozen database enum. Do NOT invent new statuses." These two instructions contradict each other for `LOCKED`/`DELETED`. Resolution, favoring "do not invent":

| Brief's status    | Implementation                                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| ACTIVE / INACTIVE | Real `UserStatus` enum values — `activateUser()`/`deactivateUser()`                                                                                  |
| SUSPENDED         | Real enum value — exists, no dedicated endpoint added (not in the milestone's API list), reachable via a future admin PATCH if ever needed           |
| PENDING           | Real enum value — the default on creation, unchanged                                                                                                 |
| DELETED           | **Not** a status value — uses the existing `deletedAt`/`deletedBy` soft-delete columns instead, exactly like every other frozen table in this schema |
| LOCKED            | **Not** a status value — tracked in `metadata.security.locked`/`lockedAt`/`lockedReason`/`lockedBy`                                                  |

**Known limitation, documented not silently fixed:** setting `metadata.security.locked = true` does not by itself block login. Enforcing it at the actual authentication boundary would require editing Identity's frozen `AuthService`/`JwtStrategy` (`37_IDENTITY_FREEZE.md`), which this milestone does not touch. `lockUser()` does revoke all of the user's existing sessions (so an already-logged-in locked user is logged out immediately), but a fresh login attempt is not yet blocked — that requires a documented Identity-module change in a future milestone.

## Permission Conflict (Reported, Not Silently Resolved)

`PERMISSIONS` (`38_RBAC_ARCHITECTURE.md`) has exactly one user-related key: `USERS_MANAGE: 'users.manage'`. No `users.view`/`users.create`/`users.delete` split exists. Per instruction, none was added. Resulting design:

- **Admin endpoints** (`GET /users`, `GET /users/:id`, `POST /users`, `PATCH /users/:id`, `DELETE /users/:id`, `/restore`, `/lock`, `/unlock`, `/activate`, `/deactivate`, `/reset-password`, and all `/users/:id/sessions*`) require `@RequirePermission(PERMISSIONS.USERS_MANAGE)` via `PermissionGuard`.
- **Self-service endpoints** (`GET /users/me`, `PATCH /users/me/profile`, `PATCH /users/me/preferences`, `PATCH`/`DELETE /users/me/avatar`) require only the existing global `JwtAuthGuard` — no additional permission — mirroring the exact precedent `AuthorizationController.getMyAuthorization()` set in Milestone 5 (acting on one's own record isn't "managing users").
- **`POST /users/:id/change-password`** is a special case: the milestone's endpoint list places it under `/users/:id/*`, but it is inherently self-service (requires the caller's own current password). It carries no `@RequirePermission` — instead the controller checks `id === currentUser.id` and throws `ForbiddenException` otherwise. `POST /users/:id/reset-password` (admin, no current-password check) remains `users.manage`-gated.
- `/users/:id/sessions*` are **admin-only** in this implementation (no self-access shortcut) — simpler and matches the literal endpoint list, which has no `/users/me/sessions`.

## Schema/Docs Conflict (Reported, Not Silently Resolved)

`docs/31_DATABASE_TABLES.md` (lines 21–22) claims `email UNIQUE` and per-site-scoped uniqueness. Neither exists in the frozen schema — confirmed by a full-file grep for `@unique`/`@@unique` (the only hit anywhere is `ArticleRevision`). **Email/username uniqueness is enforced at the application layer only** (`UsersRepository.findByEmail`/`findByUsername` check-then-write in `UsersService.createUser`/`updateUser`), with the same residual race-condition caveat already documented for Settings' Global scope in `39_SETTINGS_ARCHITECTURE.md`. A concurrent create with the same email could still both succeed absent a database constraint — closing this requires a migration, out of scope here.

## Reuse Strategy (Identity Module)

Identity's own `UserRepository` explicitly documents itself as auth-only (4 methods: `findActiveByEmail`, `findActiveById`, `updateLastLogin`, `updatePasswordHash`) and states it is _not_ general CRUD — "belongs to the future Users module." This module's `UsersRepository` is a **separate, new class**; Identity's file is untouched.

`IdentityModule` exports only `JwtAuthGuard`, `OptionalAuthGuard`, `JwtModule` — not `PasswordService`, `SessionService`, `TokenService`, `SessionRepository`, or `RefreshTokenRepository`. Rather than edit the frozen `IdentityModule` to add exports, `UsersModule`:

1. Imports `IdentityModule` (gaining `JwtModule`'s exported `JwtService`, needed by `TokenService`).
2. Re-provides the exact same `PasswordService`/`TokenService`/`SessionService`/`SessionRepository`/`RefreshTokenRepository` classes (imported, not duplicated) as its own providers.

This means password hashing (`PasswordService.hash`/`.compare`), refresh-token rotation semantics, and session revocation (`SessionService.revokeAllForUser`) are the literal same code Identity uses — zero duplicated logic — while `modules/identity/` remains byte-for-byte unedited.

`Session` listing (`GET /users/:id/sessions`) and single-session lookup (needed by `terminateSession`) required methods Identity's `SessionRepository` doesn't have (`findAllForUser`, `findById`). Rather than add methods to that frozen file, a new, read-only `UserSessionsRepository` was created in this module for exactly those two queries. Actual revocation still goes through Identity's real `SessionRepository.revoke()`/`RefreshTokenRepository.revoke()`.

## CRUD Flow

```
POST /users → check email/username uniqueness (app layer) → hash password (if provided) → create → audit log
GET /users/:id → find (excludes soft-deleted) → 404 if missing → map
GET /users → filter (email/username/displayName/role/status/date range/search) → sort → paginate → map
PATCH /users/:id → check username uniqueness (if changed) → update → audit log
DELETE /users/:id → reject if already deleted → soft-delete (deletedAt/deletedBy) → revoke all sessions → audit log
POST /users/:id/restore → reject if not deleted → clear deletedAt/deletedBy → audit log
```

## Profile Flow

`PATCH /users/me/profile` → `UsersValidator.validateProfile()` (phone regex, URL parseability, locale regex, `ProfileVisibility` enum — defense-in-depth on top of the DTO's own class-validator decorators) → merge into `metadata.profile` (shallow merge, PATCH semantics — only provided fields change) → persist → map.

## Preferences Flow

Same shape as Profile Flow, targeting `metadata.preferences`; `UsersValidator.validatePreferences()` additionally checks that `editorPreference`/`dashboardPreference`/`accessibilityPreference`/`notificationPreference` are plain JSON objects, not arrays or primitives.

## Session Flow

```
GET /users/:id/sessions → UserSessionsRepository.findAllForUser() → map to SessionResponseDto[]
DELETE /users/:id/sessions/:sessionId → find session, verify session.userId === :id (else 404, no cross-user leak)
                                       → SessionRepository.revoke(sessionId)
                                       → if refreshTokenId present, RefreshTokenRepository.revoke(refreshTokenId, reason)
DELETE /users/:id/sessions → SessionService.revokeAllForUser(id)  [also fulfills the brief's "Force Logout User" feature —
                                                                    no separate endpoint exists for it beyond this one]
```

`browser`/`operatingSystem`/`country`/`city` on `SessionResponseDto` are passed through exactly as Identity's frozen `Session` model stores them — **metadata only, never populated** (no UA parser or geo-IP lookup is wired anywhere in this codebase, per `37_IDENTITY_FREEZE.md`).

## Password Flow

```
Self:  POST /users/:id/change-password  (id must equal caller's own id, else 403)
       → PasswordService.compare(currentPassword, user.passwordHash) → 403 if wrong
       → PasswordService.hash(newPassword) → UsersRepository.updatePasswordHash()
       → SessionService.revokeAllForUser()  [37_IDENTITY_FREEZE.md's documented rule: password change revokes every session]

Admin: POST /users/:id/reset-password  (requires users.manage; no current-password check)
       → same hash + revoke-all-sessions flow, no ownership check
```

Both DTOs (`ChangePasswordDto`, `AdminResetPasswordDto`) validate `newPassword` against Identity's existing `PASSWORD_POLICY_REGEX`/`PASSWORD_POLICY_DESCRIPTION` (`modules/identity/policies/password.policy.ts`) — imported directly, not re-declared.

## Avatar Flow

"Architecture only... NO storage implementation... Only metadata," per the milestone brief. `User.profileImageId` is an existing FK to `MediaAsset` — **not** a raw URL string. `UpdateAvatarDto` accepts a `mediaAssetId` (UUID) that must reference an already-existing `MediaAsset` row (verified via a read-only lookup in `UsersRepository.findMediaAssetById`, throwing `MediaAssetNotFoundException` otherwise); `RemoveAvatar` clears `profileImageId` to `null`. No Media module, upload endpoint, or storage provider exists yet — a caller must already have a `MediaAsset` id from elsewhere (out of scope for this milestone to provide).

## Search / Pagination / Filtering / Sorting

`GET /users` accepts `UserQueryDto` (extends the new shared `PaginationQueryDto` in `common/dto/pagination.dto.ts` — the first module to populate that previously-placeholder file): `email`, `username`, `displayName`, `role` (via the existing `UserRole`→`Role` relation), `status`, `createdFrom`/`createdTo`, `updatedFrom`/`updatedTo`, free-text `search` (OR-matches email/username/displayName), `sortBy` (`UserSortField`: name/email/createdAt/updatedAt/lastLoginAt/status), `sortOrder` (asc/desc), `page`, `limit`.

`UsersRepository.findMany()` returns `{ items, total }`; `UsersService.listUsers()` wraps it via the new `buildPaginatedResult()` helper into a `PaginatedResult<UserResponseDto>`. **`ResponseInterceptor` was extended** (backward-compatible — existing behavior for every non-paginated controller is unchanged) to recognize this shape and populate the frozen envelope's `meta.pagination` (`page`, `limit`, `total`, `hasNext`, `hasPrevious`) instead of nesting it under `data`. This is the same kind of additive, non-breaking extension Milestone 6 made to `ApiWrappedResponse` for array responses.

Offset-based pagination only (`page`/`limit` → Prisma `skip`/`take`); "cursor-ready architecture" per the brief means the repository's query-building is isolated behind `findMany(options)`, so swapping to cursor-based pagination later is a repository-internal change, not a service/controller/DTO change.

## Security

- Every write action that changes account access (create with password, change/reset password, lock, deactivate, delete) revokes all existing sessions where applicable, consistent with Identity's existing "password change revokes every session" rule.
- `SecurityLoggerService.record()` is called for lock/unlock, admin password reset, and session termination — mirroring the exact pattern `global-exception.filter.ts` and Identity's `auth.service.ts` already use.
- `AuditLoggerService.record()` is called for create/update/delete/restore/activate/deactivate/unlock/password changes/terminate-all-sessions — **log-line only** (Pino), not persisted to the `AuditLog` table; that persistence is explicitly deferred to a future Audit business module (per `AuditLoggerService`'s own doc comment), unchanged by this milestone.
- No new `EventBus`/`DomainEvent` implementation was added — `core/interfaces/event-bus.interface.ts`/`events.interface.ts` remain pure interfaces with zero DI providers. A future event-driven module would publish from exactly these points: after `createUser`, `updateUser`, `softDeleteUser`, `restoreUser`, `lockUser`/`unlockUser`, `activateUser`/`deactivateUser`, and password changes — named here so the hook points are documented, without any code depending on an interface nothing implements yet.

## Future Storage Integration

Once a Media/Storage module exists with real upload handling, it would create the `MediaAsset` row and hand its id to `PATCH /users/me/avatar` — this module's `UpdateAvatarDto`/`updateAvatar()` need no change; they already accept and validate an existing `mediaAssetId`.

## Future Email Integration

Password reset/change notifications, lock/unlock notices, etc. would use Identity's existing `EmailProvider` interface (`37_IDENTITY_FREEZE.md`) once a concrete provider is implemented — this module makes no email calls itself, consistent with "NO Email provider implementation" in the brief.

## Future AI Integration

None — no AI-related fields, hooks, or dependencies exist in this module, per `40_PRODUCT_PHILOSOPHY.md` Principle 1 ("AI is Optional... every core workflow must be fully usable with AI completely disabled"). User Management works completely manually.

## Future SaaS Compatibility

`User.tenantId`/`siteId` (both already nullable columns) are accepted by `UsersRepository.create()` but not yet exposed through any DTO or query filter in this milestone (single-site V1, per `40_PRODUCT_PHILOSOPHY.md`). Adding tenant/site-scoped queries later is a repository-level change only — `UsersService`'s public API is designed so callers wouldn't need to change.

## Testing

Unit tests only, matching this codebase's existing convention (mocked dependencies, no e2e beyond direct-call specs): `UsersValidator` (17 tests), `UsersRepository` (9, mocked `PrismaService`), `UserSessionsRepository` (2), `UsersService` (18, mocked repositories/Identity services), `UsersController` (9, mocked service, including the change-password ownership check), plus 2 DTO specs (`CreateUserDto`, `UpdateProfileDto`) following the exact `plainToInstance`/`validate()` pattern already used by `reset-password.dto.spec.ts`. Total: 191 tests / 28 suites passing workspace-wide (was 132/21 before this milestone).

## Deferred / Explicitly Out of Scope

Frontend, Admin UI, AI, live Email/Storage/Search providers, OAuth/MFA/social login, multi-tenant/SaaS behavior, Role/Permission CRUD, Organization module, a `users.view` permission split (see `38_RBAC_ARCHITECTURE.md`'s existing "Future Enhancement" section, unchanged by this milestone), durable audit-log persistence, working event-bus wiring, locking a user actually blocking login at the Identity boundary, cursor-based pagination, self-service session listing at `/users/me/sessions`.

## Approved Date

Pending — awaiting explicit approval before Milestone 8, per this milestone's own instruction.

## Architecture Status

**IMPLEMENTED, AWAITING APPROVAL** — User Management Foundation (Milestone 7).
