# 38_RBAC_ARCHITECTURE

## Executive Summary

Official freeze declaration for the RBAC Foundation (Milestone 5). Mirrors `36_DATABASE_FREEZE.md`'s role for the database and `37_IDENTITY_FREEZE.md`'s role for authentication: from this point forward, `apps/backend/src/modules/authorization/` is the literal implementation of what this document freezes. It delivers the third stage of the architecture goal from the milestone brief — `Identity -> Authentication -> Authorization -> Business Modules` — as a permission/role **resolution engine only**. It does not add User/Role/Permission CRUD, an admin UI, or any business-module logic; those remain future work (see Deferred, below).

No schema or migration changes were made. The engine reads exclusively from the existing Milestone 3 tables: `User`, `Role`, `Permission`, `RolePermission`, `UserRole`.

## Module Identity

Implemented as `modules/authorization/`, sitting after `modules/identity/` in the request pipeline:

```
authorization/
├── controllers/   — AuthorizationController (1 endpoint: GET /authorization/me)
├── services/      — AuthorizationService (the single source of truth for permission checks)
├── repositories/  — UserRoleRepository, RolePermissionRepository (read-only, existing tables only)
├── interfaces/    — SystemRole enum, PERMISSIONS constants, ROLE_HIERARCHY map
├── utils/         — resolveRoleHierarchy() (transitive closure over the hierarchy map)
├── decorators/    — @RequirePermission, @RequireAnyPermission, @RequireAllPermissions, @RequireRole
├── guards/        — PermissionGuard, RoleGuard, AuthorizationGuard (none global)
├── policies/      — Policy<T> + ArticlePolicy/MediaPolicy/CommentPolicy/SettingsPolicy (interfaces only)
├── providers/     — PermissionProvider/RoleProvider/PolicyProvider/AuthorizationCacheProvider (interfaces only)
├── dto/           — MyAuthorizationDto
└── authorization.constants.ts — the 4 Reflector metadata keys
```

Supersedes and retires the Milestone 2-era placeholders, which no longer exist: `modules/authorization/roles.ts`, `common/guards/permissions.guard.ts`, `common/guards/roles.guard.ts`, `common/decorators/permissions.decorator.ts`, `common/decorators/roles.decorator.ts`. See `21_BACKEND_IMPLEMENTATION_PLAN.md` Phase 2.8 for the historical record of what those originally planned to be.

## Permission Naming Convention

Every permission is a lowercase `resource.action` string — never numeric, never nested beyond one dot (`interfaces/permission.constants.ts`):

```ts
export const PERMISSIONS = {
  ARTICLE_CREATE: 'article.create',       ARTICLE_UPDATE: 'article.update',
  ARTICLE_DELETE: 'article.delete',       ARTICLE_PUBLISH: 'article.publish',
  CATEGORY_CREATE: 'category.create',     MEDIA_UPLOAD: 'media.upload',
  MEDIA_DELETE: 'media.delete',           SEO_MANAGE: 'seo.manage',
  COMMENT_MODERATE: 'comment.moderate',   SETTINGS_MANAGE: 'settings.manage',
  USERS_MANAGE: 'users.manage',           ROLES_MANAGE: 'roles.manage',
  PERMISSIONS_MANAGE: 'permissions.manage', DASHBOARD_VIEW: 'dashboard.view',
  ANALYTICS_VIEW: 'analytics.view',       MENU_MANAGE: 'menu.manage',
  PAGE_MANAGE: 'page.manage',             THEME_MANAGE: 'theme.manage',
  ADS_MANAGE: 'ads.manage',               API_MANAGE: 'api.manage',
  SYSTEM_MANAGE: 'system.manage',
} as const;
```

21 keys, frozen from the milestone brief's example list. `buildPermissionKey(resource, action)` is the only sanctioned way to construct one dynamically — no call site should hand-write a `resource.action` literal outside this file. Adding a new permission means adding a new entry here **and** updating this document, never inventing an ad-hoc string at a call site. The actual granting of a permission to a role is data (`RolePermission` rows), not code — this file only freezes the vocabulary of valid keys, not which roles hold them.

## Role Foundation (11 Frozen System Roles)

`interfaces/system-role.enum.ts` — string values match the future `Role.name` column exactly:

| Enum member | Value |
|---|---|
| `SUPER_ADMIN` | `Super Admin` |
| `ADMINISTRATOR` | `Administrator` |
| `EDITOR` | `Editor` |
| `AUTHOR` | `Author` |
| `CONTRIBUTOR` | `Contributor` |
| `MODERATOR` | `Moderator` |
| `SEO_MANAGER` | `SEO Manager` |
| `ADS_MANAGER` | `Ads Manager` |
| `ANALYTICS_VIEWER` | `Analytics Viewer` |
| `SUBSCRIBER` | `Subscriber` |
| `GUEST` | `Guest` |

These are code-level constants only — no seed data inserts them into `Role` (see `36_DATABASE_FREEZE.md`, which deliberately does not seed Roles/Permissions). Against an empty `Role` table the engine still behaves correctly: every resolution method returns an empty set rather than throwing.

## Role Hierarchy

Frozen in `interfaces/role-hierarchy.ts` as a pure in-code map — no `parentRoleId` column exists or was added (schema changes were explicitly out of scope). Only the linear chain the milestone brief diagrammed is modeled:

```
Super Admin -> Administrator -> Editor -> Author -> Contributor
```

```ts
export const ROLE_HIERARCHY: Readonly<Record<string, readonly string[]>> = {
  [SystemRole.SUPER_ADMIN]: [SystemRole.ADMINISTRATOR],
  [SystemRole.ADMINISTRATOR]: [SystemRole.EDITOR],
  [SystemRole.EDITOR]: [SystemRole.AUTHOR],
  [SystemRole.AUTHOR]: [SystemRole.CONTRIBUTOR],
  [SystemRole.CONTRIBUTOR]: [],
  // Moderator, SEO Manager, Ads Manager, Analytics Viewer, Subscriber, Guest
  [SystemRole.MODERATOR]: [],
  [SystemRole.SEO_MANAGER]: [],
  [SystemRole.ADS_MANAGER]: [],
  [SystemRole.ANALYTICS_VIEWER]: [],
  [SystemRole.SUBSCRIBER]: [],
  [SystemRole.GUEST]: [],
};
```

The other 6 system roles are standalone leaves with no inheritance — a deliberate interpretation, since the brief's hierarchy diagram only showed the one chain and inventing inheritance for the rest would be unspecified business logic. `resolveRoleHierarchy()` (`utils/resolve-role-hierarchy.util.ts`) expands a set of directly-assigned role names into their full transitive closure using a `Set` (dedup-safe and cycle-safe by construction, since the map is a fixed acyclic chain).

## Permission Resolution

Two-stage resolution, both stages read-only against existing tables:

```
UserRole (userId -> roleId)          — UserRoleRepository.findRoleNamesForUser()
        │  filters soft-deleted roles (role.deletedAt)
        ▼
Direct role names ["Editor"]
        │  resolveRoleHierarchy()
        ▼
Effective role names ["Editor", "Author", "Contributor"]   (AuthorizationService.resolveEffectiveRoles)
        │
        ▼
Role -> RolePermission -> Permission                 — RolePermissionRepository.findPermissionKeysForRoleNames()
        │  filters soft-deleted permissions (permission.deletedAt)
        │  builds "resource.action" via buildPermissionKey(), deduped via Set
        ▼
Flat permission key list ["article.create", "article.update", ...]  (AuthorizationService.resolvePermissions)
```

A Super Admin's `resolvePermissions()` call therefore returns the union of every permission granted to Super Admin, Administrator, Editor, Author, and Contributor roles — computed fresh from the database on every call, since no cache is wired yet (see Provider Abstractions).

## Authorization Flow

```
Request
   │
   ▼
Global JwtAuthGuard (Milestone 4, APP_GUARD)  — rejects unauthenticated requests, attaches AuthenticatedUser
   │
   ▼
Route-level guard, opt-in only (none global):
   PermissionGuard | RoleGuard | AuthorizationGuard
   │  reads @RequirePermission/@RequireAnyPermission/@RequireAllPermissions/@RequireRole metadata
   │  no metadata present -> allow (guard is a no-op for routes that don't declare a requirement)
   │  metadata present but no authenticated user -> deny
   ▼
AuthorizationService.hasPermission() / hasAnyPermission() / hasAllPermissions() / hasRole()
   │
   ▼
UserRoleRepository / RolePermissionRepository -> PrismaService -> PostgreSQL
```

Every check is keyed by `userId`, never by a JWT claim — consistent with `37_IDENTITY_FREEZE.md`'s rule that `role` in the JWT payload is reserved for forward-compatibility only and **must never be read for authorization**. This engine only ever queries the database/service layer, satisfying that rule under Milestone 5 exactly as it did when no Roles module existed at all.

## AuthorizationService API

The single source of truth business modules must call — they must never compute permissions themselves:

| Method | Signature | Behavior |
|---|---|---|
| `resolveInheritedRoles` | `(roleNames: string[]) => string[]` | Synchronous hierarchy expansion, no DB call |
| `resolveEffectiveRoles` | `(userId: string) => Promise<string[]>` | Direct roles + inherited roles |
| `resolvePermissions` | `(userId: string) => Promise<string[]>` | Flat deduped permission keys across effective roles |
| `hasPermission` | `(userId, permission: string) => Promise<boolean>` | Single-permission check |
| `hasAnyPermission` | `(userId, permissions: string[]) => Promise<boolean>` | OR semantics; empty array => `true` |
| `hasAllPermissions` | `(userId, permissions: string[]) => Promise<boolean>` | AND semantics; empty array => `true` |
| `hasRole` | `(userId, roleName: string) => Promise<boolean>` | True if held directly or via inheritance |
| `can` | `(userId, permission: string) => Promise<boolean>` | Placeholder gate; today delegates to `hasPermission`, kept as its own method so a future policy-aware implementation (consulting a `Policy`) can replace its body without changing callers |

## Decorators

Thin `SetMetadata()` wrappers over 4 keys in `authorization.constants.ts` (`authz:require_permission`, `authz:require_any_permission`, `authz:require_all_permissions`, `authz:require_role`):

| Decorator | Metadata key | Read by |
|---|---|---|
| `@RequirePermission(...perms)` | `REQUIRE_PERMISSION_KEY` | `PermissionGuard`, `AuthorizationGuard` (AND semantics — `hasAllPermissions`) |
| `@RequireAnyPermission(...perms)` | `REQUIRE_ANY_PERMISSION_KEY` | `PermissionGuard`, `AuthorizationGuard` (OR semantics — `hasAnyPermission`) |
| `@RequireAllPermissions(...perms)` | `REQUIRE_ALL_PERMISSIONS_KEY` | `PermissionGuard`, `AuthorizationGuard` (AND semantics — `hasAllPermissions`) |
| `@RequireRole(...roles)` | `REQUIRE_ROLE_KEY` | `RoleGuard`, `AuthorizationGuard` (OR semantics — any listed role passes) |

None of these decorators enforce anything by themselves — they only attach metadata. Enforcement happens exclusively in the guards below, and only on routes that also apply one of those guards via `@UseGuards()`.

## Guard Flow

Three guards, all opt-in — **none is registered globally** (`app.module.ts`'s `APP_GUARD` list is still exactly `ThrottlerGuard` + `JwtAuthGuard`, unchanged since Milestone 4):

- **`PermissionGuard`** — checks `@RequirePermission` (AND), `@RequireAnyPermission` (OR), and `@RequireAllPermissions` (AND) metadata. No metadata on the route => allow.
- **`RoleGuard`** — checks `@RequireRole` metadata (OR across the listed roles). No metadata on the route => allow.
- **`AuthorizationGuard`** — combined guard checking all 4 metadata keys in one pass, useful for a controller that wants a single `@UseGuards(AuthorizationGuard)` instead of stacking two guards. All declared requirement categories on a route must independently pass (permission AND role, when both are present); within a category, semantics follow the table above.

All three deny (return `false`, never throw) when metadata is present but `request.user` is absent — this should not occur in practice on a route protected by the global `JwtAuthGuard`, but the guards make no assumption about guard ordering.

## Policy Architecture

`policies/policy.interface.ts` defines a generic contract for rules a flat permission string cannot express — most notably ownership ("an Author can update their OWN article, but not someone else's"):

```ts
export interface Policy<TSubject = unknown> {
  canView?(actorRoles: readonly string[], subject: TSubject): boolean;
  canCreate?(actorRoles: readonly string[]): boolean;
  canUpdate?(actorRoles: readonly string[], subject: TSubject): boolean;
  canDelete?(actorRoles: readonly string[], subject: TSubject): boolean;
}
```

Four named specializations exist as **types/interfaces only, with zero business logic**: `ArticlePolicy` (subject: `{ authorId: string }`), `MediaPolicy`, `CommentPolicy`, `SettingsPolicy` (the latter three currently equivalent to the base `Policy<unknown>` — no subject shape is invented ahead of the modules that would define one). Nothing implements or registers a concrete policy today; `AuthorizationService.can()` does not consult one yet. Policies become real once the corresponding business module (Articles, Media, Comments, Settings) exists and needs ownership/context-aware rules beyond `hasPermission()`.

## Provider Abstractions (interfaces only — no implementation)

Mirrors the pattern established for `EmailProvider`/`PasswordHistoryProvider` in `37_IDENTITY_FREEZE.md` — pure TypeScript interfaces, zero concrete implementations, zero DI providers registered:

- **`PermissionProvider`** (`getPermissionsForRole`) — future pluggable source of permissions (e.g. an external IdP) instead of `RolePermissionRepository`.
- **`RoleProvider`** (`getRolesForUser`) — future pluggable source of role assignment instead of `UserRoleRepository`.
- **`PolicyProvider`** (`getPolicy<TSubject>(name)`) — future registry so `AuthorizationService.can()` could look up and consult a named `Policy`.
- **`AuthorizationCacheProvider`** (`get`/`set`/`invalidate`) — future cache for `resolvePermissions()`/`resolveEffectiveRoles()` results, invalidated on role/permission changes. Every `AuthorizationService` call re-queries the database today; there is no caching layer.

`AuthorizationService` depends on the concrete `Repository` classes, never on these `Provider` interfaces — the interfaces exist purely as documented future extension points, not as the engine's actual data path.

## API Surface

One endpoint, read-only self-inspection — not a management/CRUD endpoint:

`GET /authorization/me` — protected by the existing global `JwtAuthGuard` (no `@Public()`, no additional guard needed since there is nothing to require for "what are my own permissions"). Returns `MyAuthorizationDto { roles: string[]; permissions: string[] }`, resolved via `resolveEffectiveRoles()` + `resolvePermissions()` for `request.user.id`. Documented via the frozen generic wrapper `ApiWrappedResponse(MyAuthorizationDto)` from `37_IDENTITY_FREEZE.md` — no hand-rolled response schema.

## Database Footprint

**Zero schema changes, zero migrations.** Reads only from tables that already existed at the end of Milestone 3/3.1: `UserRole`, `Role`, `RolePermission`, `Permission` (and transitively `User`, via the global `JwtAuthGuard`/`JwtStrategy` from Milestone 4). Both repositories filter out soft-deleted rows (`role.deletedAt`, `permission.deletedAt`) so a deleted role/permission silently drops out of resolution rather than erroring.

## Future Extensibility

### Enterprise Support
The hierarchy map and permission key vocabulary are centralized in two files (`role-hierarchy.ts`, `permission.constants.ts`), so adding advanced roles, approval workflows, or finer-grained resource scoping (per `40_PRODUCT_PHILOSOPHY.md`'s Enterprise edition) is additive: new enum members, new hierarchy entries, new permission keys — no change to `AuthorizationService`'s public API.

### Agency Support
Because resolution is entirely driven by `UserRole`/`RolePermission` data (not hardcoded per-user logic), an agency managing multiple sites/clients can assign different role combinations per user without any code change — the `siteId` scoping already reserved in the JWT payload (`37_IDENTITY_FREEZE.md`) is available for a future site-scoped permission check layered on top of this engine.

### SaaS / Multi-tenant Compatibility
`Role` already carries `tenant_id` (per `36_DATABASE_FREEZE.md`'s multi-tenant-ready note), so a future tenant-scoped resolution query is a repository-level change, not an `AuthorizationService` API change — callers would continue to call `hasPermission(userId, permission)` unchanged. V1 remains single-tenant; no tenant filtering is implemented in this milestone.

## Testing

37 new tests added on top of Milestone 4.1's 44 (81 total / 16 suites), covering: role-hierarchy resolution (chain expansion, mid-chain start, standalone roles, dedup, empty input, unknown role name), `AuthorizationService` (all 8 methods, mocked repositories), all 3 guards (metadata-absent allow, no-user deny, AND/OR semantics, combined-guard cross-category denial), all 4 decorators (metadata correctness via direct `Reflect.getMetadata` reads), and policy foundation shape (interface satisfiability, no business logic asserted).

## Deferred / Explicitly Out of Scope

User/Role/Permission CRUD, admin UI for role/permission management, role/permission seeding, concrete `Policy` implementations, any `Provider` interface implementation or DI binding, permission caching, global registration of any authorization guard, tenant-scoped permission filtering, per-site permission scoping. All per this milestone's explicit "DO NOT IMPLEMENT BUSINESS MODULES" instruction and STRICTLY DO NOT list.

## Approved Date

2026-07-16

## Architecture Status

**FROZEN** — RBAC Foundation, V1 (Milestone 5).
