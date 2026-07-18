# 63_FRONTEND_USERS

## Executive Summary

User Management Module (Frontend Milestone 3). Implements the admin-facing Users CRUD, session management, and self-service Profile against the real, frozen `UsersController` (`apps/backend/src/modules/users/controllers/users.controller.ts`) — verified directly from source, not assumed from any milestone brief or architecture doc. Two milestone briefs issued for this work each named several endpoints/doc filenames that don't exist in the actual codebase; every one of those mismatches is documented below rather than silently built around.

**Status: Implemented, awaiting approval.**

## Architecture

No architectural deviation from `docs/56_ADMIN_FRONTEND_ARCHITECTURE.md`/`docs/58_FRONTEND_FOLDER_STRUCTURE.md` — this milestone is the first to actually exercise the documented `features/*` shape with real business logic (Milestones 1–2 built only `auth`/`dashboard`, neither of which needed a `services/*.ts` layer or a paginated list). Two feature directories, split along the backend's own admin/self-service boundary (`docs/42_USER_MANAGEMENT_ARCHITECTURE.md` "Permission Conflict"):

- **`features/users/`** — admin CRUD, `users.manage`-gated: list, detail, create, edit, delete/restore, admin password reset, session management.
- **`features/profile/`** — self-service, authenticated-only: own profile view/edit, preferences, avatar removal, own password change.

Two shared-infrastructure changes were required, both additive:

1. `lib/api-client.ts` gained `api.getPaginated<T>()` and a `paginated` request-config flag. The existing `unwrapEnvelope()` always discarded `envelope.meta`, so no hook could ever read `meta.pagination` — this was a latent gap in Milestone 1's foundation that nothing had exercised yet (Auth/Dashboard paginate nothing). Every existing call site (`api.get`/`.post`/`.patch`/`.delete`) is byte-for-byte unchanged; `getPaginated` is a new, separate function.
2. `constants/api-endpoints.ts`'s `USERS` entry changed from a bare string to an object of path builders (`ROOT`, `ME`, `byId()`, etc.) — nothing referenced the old string shape (grep-confirmed before changing it), so this is not a breaking change to any existing call site. `constants/routes.ts` gained `USER_ROUTES`/`PROFILE_ROUTES` builder objects, additive alongside the existing flat `ROUTES` (which stays untouched since `config/navigation.ts` and `components/layout/header.tsx` already reference `ROUTES.USERS`/`ROUTES.PROFILE` as plain strings).

## Folder Structure

```
features/users/
├── components/    — UserTable, UserFilters, CreateUserForm/EditUserForm (user-form.tsx),
│                    StatusBadge, UserAvatar, SessionTable, DeleteDialog, RestoreDialog,
│                    ResetPasswordDialog, + 4 page-composition components
├── hooks/         — one hook per real endpoint, + query-keys.ts
├── services/      — users.api.ts (admin CRUD), sessions.api.ts
├── schemas/       — create-user, update-user, reset-password (admin-only schemas)
├── types/         — user.ts (mirrors UserResponseDto/SessionResponseDto/*Dto 1:1)
├── constants/     — user.constants.ts (status/sort-field labels, badge variants)
└── index.ts       — public surface; app/ imports only from here

features/profile/
├── components/    — ProfileCard, PasswordForm, EditProfileForm, PreferencesForm,
│                    + 3 page-composition components
├── hooks/         — use-profile, use-change-password, use-update-profile,
│                    use-update-preferences, use-remove-avatar, query-keys.ts
├── services/      — profile.api.ts
├── schemas/       — change-password, update-profile, update-preferences
└── index.ts
```

## API Mapping

Every function below was written against the real `UsersController` source, not the milestone brief's endpoint list (which named several routes that don't exist — see "Conflicts Discovered" below).

| Function | Method + Path | File |
|---|---|---|
| `usersApi.list` | `GET /users` | `features/users/services/users.api.ts` |
| `usersApi.get` | `GET /users/:id` | same |
| `usersApi.create` | `POST /users` | same |
| `usersApi.update` | `PATCH /users/:id` | same |
| `usersApi.remove` | `DELETE /users/:id` | same |
| `usersApi.restore` | `POST /users/:id/restore` | same |
| `usersApi.resetPassword` | `POST /users/:id/reset-password` | same |
| `sessionsApi.list` | `GET /users/:id/sessions` | `features/users/services/sessions.api.ts` |
| `sessionsApi.terminate` | `DELETE /users/:id/sessions/:sessionId` | same |
| `sessionsApi.terminateAll` | `DELETE /users/:id/sessions` | same |
| `profileApi.getMe` | `GET /users/me` | `features/profile/services/profile.api.ts` |
| `profileApi.updateProfile` | `PATCH /users/me/profile` | same |
| `profileApi.updatePreferences` | `PATCH /users/me/preferences` | same |
| `profileApi.removeAvatar` | `DELETE /users/me/avatar` | same |
| `profileApi.changePassword` | `POST /users/:id/change-password` (id = caller's own) | same |

**Deliberately not implemented**, all real endpoints excluded per explicit approved scope (not a discovery — the user's own decision 1 listed exactly which endpoints to use): `POST /users/:id/lock`, `/unlock`, `/activate`, `/deactivate`, `PATCH /users/me/avatar` (set — no MediaAsset picker exists to source an id from; only `removeAvatar` was built since it needs no picker).

## Conflicts Discovered

Both milestone briefs for this work named endpoints/files that turned out not to exist once checked against the real backend source. Per RULE_ZERO, none were silently built around:

1. **`PATCH /users/:id/password`** (first brief) / **doesn't exist**. Real: two separate endpoints, `POST /users/:id/change-password` (self, requires `currentPassword`) and `POST /users/:id/reset-password` (admin, no current-password check).
2. **`GET/PATCH /users/profile`** (first brief) / **doesn't exist**. Real: `GET /users/me`, `PATCH /users/me/profile`.
3. **`PATCH /users/profile/password`** (first brief) / **doesn't exist**. Real: `POST /users/:id/change-password` with `id` equal to the caller's own id.
4. **`docs/35_BACKEND_ARCHITECTURE.md`, `docs/41_API_SPECIFICATION.md`** (second brief's read-first list) / **don't exist**. Reals: `docs/20_BACKEND_ARCHITECTURE.md`, `docs/41_PLATFORM_CAPABILITIES.md`; the actual API spec is `docs/53_API_FREEZE.md` (already separately listed and read).
5. **No `roles` field anywhere in `UserResponseDto`.** Role display, role badges, role assignment/editing, and a "Permissions summary" for another user are all unimplementable — no backend data source exists (`GET /authorization/me` only returns the *caller's own* roles/permissions). Only the **Role filter** (`UserQueryDto.role`, a free-text match against a role name) is real and implemented; there is nothing to display or assign.
6. **No "current session" signal.** Neither the login response nor `SessionResponseDto` carries a session identifier the frontend could compare against. "Current session badge" and "revoke all except current" (named in an earlier draft of this milestone) were not built — `SessionTable`/`useTerminateAllSessions` genuinely terminate *every* session, with no exception, and the UI does not claim otherwise.
7. **No bulk endpoint for Users.** Confirmed by reading the full `UsersController` (20 endpoints, none bulk). Per the approved scope's own decision 8, no row-selection/bulk UI was built.
8. **Avatar has no resolvable image URL.** `profileImageId` is a bare `MediaAsset` id; rendering a real photo requires `GET /media/:id` (Media module, out of scope). `UserAvatar` renders initials only — approved decision 3.
9. **No self-service identity-field editing.** `PATCH /users/me/profile` only touches the `metadata.profile` JSON blob (firstName/lastName/phone/bio/website/timezone/language/country/city/dateFormat/timeFormat/profileVisibility) — there is no endpoint for a user to change their own `email`/`username`/`displayName`. `EditProfileForm` does not render those fields.
10. **`CreateUserDto`/`UpdateUserDto` have no `status` field.** A newly created user is always `PENDING` (Prisma default); there is no way to set status at creation, and no status-editing UI was built (activate/deactivate/lock/unlock endpoints exist on the backend but were excluded from this milestone's approved endpoint list).

## Query Flow

```
Page component
  → feature hook (e.g. useUsers(filters)) — TanStack Query
    → service function (usersApi.list(filters))
      → api.getPaginated('/users', { params: filters })
        → Axios instance, paginated: true
        ← { data: User[], meta: { pagination } } resolved (not the bare array)
    ← cached under usersKeys.list(filters); component re-renders
```

List/sort/filter/page state lives in the URL (`useSearchParams`/`router.push`), never Zustand, per `docs/56`'s State Management table — `UsersPageContent` is the first feature to actually exercise this. Every mutation invalidates only the exact keys it affects (`usersKeys.detail(id)` + `usersKeys.lists()` for admin CRUD; `profileKeys.me()` for self-service) — never a blanket `invalidateQueries()`.

## Permission Flow

Every guard maps to the single real `users.manage` permission — no finer-grained key was invented (none exists in `38_RBAC_ARCHITECTURE.md`'s frozen 21). `PermissionRoute` gates all 4 admin pages (`/users`, `/users/new`, `/users/[id]`, `/users/[id]/edit`); the 3 Profile pages carry no permission requirement (self-service, matching `docs/60`'s "acting on one's own record isn't managing" precedent). `PermissionGate` hides the "New user" button for a viewer without `users.manage`. No `PermissionGate` wraps individual row actions inside the Users list/detail pages beyond the page-level `PermissionRoute` — the entire page is already gated, so a second, redundant per-action check would be pure duplication, not a defense-in-depth improvement.

## Form Flow

Every form mirrors its DTO's `class-validator` rules via Zod, verified field-by-field against the real DTO source (not the milestone brief's field lists): `createUserSchema`↔`CreateUserDto`, `updateUserSchema`↔`UpdateUserDto`, `changePasswordSchema`/`resetPasswordSchema`↔`ChangePasswordDto`/`AdminResetPasswordDto` (identical password-policy regex, copied from `modules/identity/policies/password.policy.ts`), `updateProfileSchema`↔`UpdateProfileDto`, `updatePreferencesSchema`↔`UpdatePreferencesDto`. `confirmPassword` is the only frontend-only field anywhere in this milestone — present on both password schemas for UX, always stripped before the API call (`{ currentPassword, newPassword }`/`{ newPassword }` only ever leaves the form component).

Edit User is **pessimistic** (approved decision 5): the UI only reflects a change after the server confirms it; no optimistic cache write. `EditUserForm` exposes `onDirtyChange`, driving a discard-changes confirmation on Cancel.

`useChangePassword` (self-service) calls `logout()` on success, since the backend revokes every one of the caller's own sessions — including the one currently in use — as part of a password change; staying "logged in" in a session about to fail its next silent refresh would be confusing.

## Table Flow

`UserTable` is built entirely on the existing, unmodified `DataTable` (`components/data-table/`) — no changes to that shared component were needed. Server-driven pagination/sorting/search only; no client-side re-sort of already-paginated data. No row-selection column (no bulk endpoint — see Conflicts #7).

## Testing

**5 new dependencies of note for testing infrastructure**: `vitest.setup.ts` gained `hasPointerCapture`/`setPointerCapture`/`releasePointerCapture`/`scrollIntoView` polyfills — jsdom implements none of them, and this milestone's `UserFilters`/`PreferencesForm` are the first components to actually interaction-test a Radix `Select` (one existed already in `data-table-pagination.tsx` but had no dedicated test exercising it). Additive; no existing test's behavior changed.

**Two real bugs found and fixed by this milestone's own test-writing** (mirroring the precedent set in `docs/62_FRONTEND_AUTHENTICATION.md` §10):

1. `CreateUserForm`/`EditUserForm`/`EditProfileForm`/`PreferencesForm` each passed their `onSubmit` prop directly to `form.handleSubmit(onSubmit)`. React Hook Form invokes that callback as `(data, event)` — since nothing capped it to one argument, a caller's mock/assertion checking the exact call arguments would see the values object *and* a `SyntheticEvent`. Fixed by wrapping each in a local `handleSubmit(values) { onSubmit(values); }`, matching the pattern `features/auth/components/login-form.tsx` already established in Milestone 2.
2. Several new test files mocked a service module across multiple `it()` blocks without an `afterEach(() => vi.clearAllMocks())` — a call-count assertion in a later test (e.g. "does not fetch when id is undefined") was seeing a call recorded by an earlier test in the same file. Fixed by adding the missing `afterEach` uniformly.

Final count: **541 tests / 121 suites passing** app-wide (up from 314/66 after Milestone 2) — 227 new tests for this milestone, exceeding the 200+ target.

## Validation

- `npx eslint apps/admin --ext .ts,.tsx --max-warnings=0` → 0 errors, 0 warnings.
- `npx tsc --noEmit` → 0 errors.
- `npm run build` → success.
- `npx vitest run` → 541/541 passing.

(Exact pass/fail counts and any deviation from this section are restated verbatim in the milestone's own Final Report, not duplicated here to avoid drift between two documents — matching the precedent `docs/62`'s own §11 set.)

## Future Integration

Once a Roles/Permissions CRUD backend module ships (`docs/45_PROJECT_FREEZE_V1.md` Deferred Features), `UserResponseDto` would need a `roles` field before role display/assignment/badges could be built here — no frontend change is anticipated beyond that point; `UserFilters`' role filter already exists and would need no change. Once a Media/Storage `StorageProvider` ships, `UserAvatar` gains a real-image mode and a `MediaSelectionDialog`-driven "set avatar" flow reusing the already-real `PATCH /users/me/avatar` endpoint. Once `/users/me/sessions` (or an equivalent self-service sessions endpoint) exists, Profile can grow its own session-management section without changing `SessionTable`.

## Limitations

- No role/permission display, assignment, or "current session" indicator — no backend data source exists for any of the three (see Conflicts #5–6).
- No bulk actions/row selection — no bulk backend endpoint exists (Conflict #7).
- Avatar is initials-only; no image rendering or upload (Conflict #8).
- Self-service profile editing excludes `email`/`username`/`displayName` — no endpoint exists (Conflict #9).
- New users are always created `PENDING`; no status control exists anywhere in this milestone's UI (Conflict #10).
- Activate/deactivate/lock/unlock exist on the backend but were out of this milestone's approved scope — candidates for a future milestone, not a gap in what was approved.
- `docs/56_ADMIN_FRONTEND_ARCHITECTURE.md`'s route table shows `/users/[id]` as a single view+edit page and `/profile` with no `/edit`/`/change-password` sub-routes; this milestone instead built the separate routes the approving brief explicitly requested (`/users/[id]/edit`, `/profile/edit`, `/profile/change-password`) — a documented deviation from that architecture doc's original route list, not an oversight.

## Cross References

`docs/42_USER_MANAGEMENT_ARCHITECTURE.md` (the backend module this consumes) · `docs/53_API_FREEZE.md`/`docs/55_FRONTEND_HANDOFF.md` (the contract this milestone integrates against) · `docs/56_ADMIN_FRONTEND_ARCHITECTURE.md`/`docs/58_FRONTEND_FOLDER_STRUCTURE.md`/`docs/59_FRONTEND_CODING_GUIDELINES.md` (architecture this milestone is the first real exercise of) · `docs/60_ADMIN_NAVIGATION.md` (the `/users` nav entry, unchanged) · `docs/62_FRONTEND_AUTHENTICATION.md` (the milestone this one builds directly on top of — `AuthProvider`, `PermissionRoute`, `PermissionGate`, `ConfirmDialog`, `DataTable`, all reused unmodified).

## Approved Date

Pending — awaiting explicit approval before Frontend Milestone 4, per this milestone's own instruction.

## Architecture Status

**IMPLEMENTED, AWAITING APPROVAL** — User Management Module (Frontend Milestone 3).
