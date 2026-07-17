# 43_CONFLICT_RESOLUTION

## Executive Summary

Single source of truth for every architecture conflict identified and resolved across Milestones 2–12. Milestones 2–7 use the original seven-field format (**Milestone, Conflict, Reason, Decision, Resolution, Files Affected, Current Status**); Milestones 8–12 (added in the post-Milestone-12 stabilization patch) use a six-field format (**Conflict, Root Cause, Resolution, Status, Future Impact, Documentation Updated**) matching that patch's requested structure — both are equivalent in substance, just labeled differently. Milestones 8–11 entries here are a curated summary of each milestone's most significant conflicts, not an exhaustive reprint — the full list for each remains in that milestone's own doc (`docs/46`–`49`, `51`), cross-referenced from each entry below. Per `RULE_ZERO` ("Documentation is the source of truth... No architecture changes during implementation"), no conflict below was resolved silently — each was reported at the time it was found, in the same change that resolved it. This document consolidates all of them in one place rather than requiring a reader to cross-reference every milestone doc individually.

Entries are grouped by the milestone in which the conflict was first identified, in delivery order. Each entry uses the same seven fields: **Milestone, Conflict, Reason, Decision, Resolution, Files Affected, Current Status**.

---

## Milestone 2 — Backend Scaffolding & Core Infrastructure

### Conflict: Authorization framework placeholders superseded before use

- **Milestone:** 2 (Phase 2.8, per `21_BACKEND_IMPLEMENTATION_PLAN.md`)
- **Conflict:** Phase 2.8 planned three placeholder files (`modules/authorization/roles.ts`, `common/guards/permissions.guard.ts`, `common/decorators/permissions.decorator.ts`) as "authorization concepts and RBAC contracts."
- **Reason:** These were scaffolded before the real permission/role model existed, per the phase's own goal of avoiding premature business logic.
- **Decision:** Retire the placeholders entirely once Milestone 5 built the real engine, rather than evolving them in place.
- **Resolution:** Milestone 5 deleted all three files (plus `common/guards/roles.guard.ts`, `common/decorators/roles.decorator.ts`, added in the interim) and replaced them with `modules/authorization/` in full. `21_BACKEND_IMPLEMENTATION_PLAN.md` Phase 2.8 retains a note pointing to `38_RBAC_ARCHITECTURE.md` as the historical record.
- **Files Affected:** `docs/21_BACKEND_IMPLEMENTATION_PLAN.md` (superseded-note added), `modules/authorization/*` (Milestone 5).
- **Current Status:** Resolved. Frozen as of Milestone 5.

### Conflict: Health check scope narrower than the architecture doc's ideal

- **Milestone:** 2.1
- **Conflict:** `20_BACKEND_ARCHITECTURE.md` §18 describes health checks covering "database, cache, queue, storage." Milestone 2.1 shipped only `/health` (info), `/live` (no checks), `/ready` (database only).
- **Reason:** Cache/queue/storage adapters didn't exist yet at Milestone 2.1 — checking a dependency that isn't implemented isn't possible.
- **Decision:** Ship the three endpoints with database-only readiness checking now; extend `/ready` as each adapter is implemented.
- **Resolution:** `20_BACKEND_ARCHITECTURE.md` §18 was written to explicitly say "cache/queue/storage checks are added once those adapters are implemented" rather than silently under-delivering against an unqualified requirement.
- **Files Affected:** `docs/20_BACKEND_ARCHITECTURE.md` §18, `modules/health/*`.
- **Current Status:** Partially resolved — no cache/queue/storage adapter has been implemented through Milestone 7, so `/ready` still checks only the database. Not a regression; the doc's own caveat still applies.

### Conflict: Feature Flags storage — first appearance (later reversed in Milestone 6)

- **Milestone:** 2.1
- **Conflict:** Whether feature toggles should be a database table or environment-variable-only.
- **Reason:** A dynamic, DB-backed `feature_flags` table was considered but explicitly rejected for V1 — "feature flagging is a future release concern" (`35_ARCHITECTURE_FREEZE.md`, Rejected Audit Suggestions).
- **Decision:** `FEATURE_*_ENABLED` env vars only, no database, no API, no UI. `FeatureFlagsService`'s own code comment stated this rejection explicitly.
- **Resolution:** Shipped as static, environment-configurable switches (`core/feature-flags/`).
- **Files Affected:** `apps/backend/src/config/feature-flags.config.ts`, `core/feature-flags/*`, `docs/35_ARCHITECTURE_FREEZE.md`.
- **Current Status:** **Superseded by Milestone 6** — see the Milestone 6 entry below. This entry is retained for historical accuracy per this document's "nothing should be omitted" instruction.

---

## Milestone 3 / 3.1 — Database Foundation

### Conflict: Menus/ActivityLogs inconsistency across three docs

- **Milestone:** 3.1
- **Conflict:** `31_DATABASE_TABLES.md` fully specified `Menus` and `ActivityLogs` (no deferred marker), but `32_ENTITY_RELATIONSHIP.md`'s ER diagram and `35_ARCHITECTURE_FREEZE.md`'s Final Database Summary omitted both.
- **Reason:** The three documents were authored at different times and drifted out of sync before the freeze pass.
- **Decision:** Both models are V1 — align all three documents and the schema to agree.
- **Resolution:** `32_ENTITY_RELATIONSHIP.md` and `35_ARCHITECTURE_FREEZE.md` were updated in Milestone 3.1 to include both; the schema already had them.
- **Files Affected:** `docs/31_DATABASE_TABLES.md`, `docs/32_ENTITY_RELATIONSHIP.md`, `docs/35_ARCHITECTURE_FREEZE.md`.
- **Current Status:** Resolved and frozen (`36_DATABASE_FREEZE.md` §"Documentation Sync").

### Conflict: Migrations generated without a live database

- **Milestone:** 3.1
- **Conflict:** Standard practice is `prisma migrate dev` against a live database; no live PostgreSQL instance was reachable in the Milestone 3 build environment.
- **Reason:** Environment constraint at authoring time, not a design choice.
- **Decision:** Generate migrations via `prisma migrate diff --script` (deterministic, reproducible from `schema.prisma`) instead, and flag that live verification was still outstanding.
- **Resolution:** `36_DATABASE_FREEZE.md`'s Migration Strategy section explicitly documented this as an open risk ("has not been executed against a live database and should be verified there before relying on it in staging/production").
- **Files Affected:** `config/prisma/migrations/*`, `docs/36_DATABASE_FREEZE.md`.
- **Current Status:** **Resolved during environment setup** (this development environment session) — `prisma migrate status` was run against the real Supabase database via the direct (non-pooler) connection and confirmed: "3 migrations found... Database schema is up to date!" Live verification is complete.

### Conflict: Prisma's `@@unique` can't express partial (soft-delete-aware) uniqueness

- **Milestone:** 3.1
- **Conflict:** Every soft-deletable table needs uniqueness scoped to active (`deletedAt IS NULL`) rows only, but Prisma's schema DSL has no `WHERE` clause for `@@unique`.
- **Reason:** ORM limitation, not a business decision.
- **Decision:** Represent each such constraint twice: a plain `@@index` in `schema.prisma` (query performance only) plus a real `CREATE UNIQUE INDEX ... WHERE "deleted_at" IS NULL` in a hand-authored migration.
- **Resolution:** 25 partial unique indexes added via `config/prisma/migrations/20260716000001_partial_unique_indexes/migration.sql`; Prisma never sees the partial index, so future `prisma migrate dev` runs won't try to "correct" it.
- **Files Affected:** `config/prisma/schema.prisma`, `config/prisma/migrations/20260716000001_partial_unique_indexes/`.
- **Current Status:** Resolved and frozen. **Important caveat surfaced in Milestone 6/7:** Postgres unique indexes treat `NULL` as distinct, so this technique does not protect rows where the scoping column itself is `NULL` (Global-scope Settings, and — discovered in Milestone 7 — the `Setting`/`User` tables' analogous Global/no-site cases). See the Milestone 6 and 7 "uniqueness" entries below.

---

## Milestone 4 / 4.1 — Identity & Authentication Foundation

### Conflict: Module named "Auth" in planning docs, "Identity" in implementation

- **Milestone:** 4, patched 4.1
- **Conflict:** `20_BACKEND_ARCHITECTURE.md` §4 and `35_ARCHITECTURE_FREEZE.md`'s original Final Module List both referred to "Auth" before the module was built.
- **Reason:** "Identity" better describes the module's actual scope (authentication + session + token lifecycle), decided during implementation.
- **Decision:** Implement as `modules/identity/`, not `modules/auth/`; fully supersede the Milestone 2 `modules/auth` scaffold.
- **Resolution:** Both planning docs updated in Milestone 4.1 to point to the actual name.
- **Files Affected:** `docs/20_BACKEND_ARCHITECTURE.md` §4, `docs/35_ARCHITECTURE_FREEZE.md`, `modules/identity/*`.
- **Current Status:** Resolved and frozen (`37_IDENTITY_FREEZE.md`).

### Conflict: JWT payload scope — temptation to embed roles/permissions

- **Milestone:** 4.1
- **Conflict:** A natural design temptation is to embed roles/permissions in the JWT for fast authorization checks without a DB round-trip.
- **Reason:** No Roles module existed at Milestone 4 — embedding permissions would have meant either inventing a role model early or shipping an empty/fake claim.
- **Decision:** Freeze the JWT payload to exactly four claims (`sub`, `email`, `role` — always `null`, `siteId`); `role` reserves the claim shape for forward-compatibility only and must never be read for authorization, even after Milestone 5 built the real RBAC engine.
- **Resolution:** `JwtStrategy.validate()` does a real database lookup by `sub` on every request; `AuthenticatedUser` always comes from the fresh DB row, never token claims. Milestone 5's `AuthorizationService` queries the database directly, never the JWT, satisfying this rule under the real engine exactly as it did when no Roles module existed at all.
- **Files Affected:** `modules/identity/interfaces/jwt-payload.interface.ts`, `modules/identity/strategies/jwt.strategy.ts`, `docs/37_IDENTITY_FREEZE.md`, `docs/38_RBAC_ARCHITECTURE.md`.
- **Current Status:** Resolved and frozen. Reaffirmed, not violated, by Milestone 5.

### Conflict: Session/refresh-token strategy — blacklist vs. rotation

- **Milestone:** 4
- **Conflict:** Two common refresh-token security models exist: a revocation blacklist, or rotation-only (single-use tokens, reuse detection via absence).
- **Reason:** A blacklist requires an additional table and an unbounded-growth cleanup strategy; rotation is self-cleaning (each token is single-use by construction).
- **Decision:** Rotation is the entire strategy — no blacklist table, no revocation list beyond what rotation itself produces. Reuse of an already-rotated token is rejected because `findActiveByHash` excludes revoked/expired rows.
- **Resolution:** One active `Session` row per refresh token, revoked and replaced together on rotation/logout; opaque 384-bit tokens, SHA-256-hashed at rest (deliberately not JWTs, deliberately not bcrypt — bcrypt's slow hashing defends low-entropy passwords, not high-entropy random tokens).
- **Files Affected:** `modules/identity/services/session.service.ts`, `modules/identity/repositories/{session,refresh-token}.repository.ts`, `docs/37_IDENTITY_FREEZE.md`.
- **Current Status:** Resolved and frozen. Reused as-is by Milestone 7 (Users module re-provides these exact classes rather than reimplementing rotation/revocation).

### Conflict: Email/password-history providers — interface now or implementation now?

- **Milestone:** 4.1
- **Conflict:** Password reset requires sending an email; preventing password reuse requires a history table. Neither existed yet.
- **Reason:** `40_PRODUCT_PHILOSOPHY.md` Principle 5 ("Interface before implementation... implement a concrete provider only when a real, immediate need exists").
- **Decision:** Define `EmailProvider` and `PasswordHistoryProvider` as pure TypeScript interfaces, zero concrete implementations, zero DI providers. `AuthService` logs generated tokens instead of emailing them (non-production only).
- **Resolution:** `deliverToken()` in `AuthService` logs rather than sends; no SMTP/SendGrid/Mailgun/SES package installed.
- **Files Affected:** `core/interfaces/email-provider.interface.ts`, `modules/identity/providers/password-history.provider.ts`, `docs/37_IDENTITY_FREEZE.md`.
- **Current Status:** Unresolved by design — still interface-only through Milestone 7. Flagged again in Milestone 7 as "Future Email Integration."

---

## Milestone 5 — RBAC Foundation

### Conflict: Permission vocabulary — closed list vs. ad-hoc strings

- **Milestone:** 5
- **Conflict:** Business modules could each invent their own permission strings as needed, or a single frozen vocabulary could be established up front.
- **Reason:** Ad-hoc strings risk typos, duplicates, and inconsistent naming (`resource.action` vs `resource-action` vs `action_resource`) as more modules are added.
- **Decision:** Freeze exactly 21 permission keys in `PERMISSIONS` (`interfaces/permission.constants.ts`); `buildPermissionKey(resource, action)` is the only sanctioned way to construct one dynamically. Adding a permission means adding an entry here **and** updating `38_RBAC_ARCHITECTURE.md` in the same change — never inventing one at a call site.
- **Resolution:** Every subsequent milestone (Settings, Users) that needed permission-gated endpoints used the single existing coarse-grained key for its resource (`settings.manage`, `users.manage`) rather than inventing finer-grained ones, and explicitly reported the resulting "no view/create/delete split" limitation instead of silently adding new keys.
- **Files Affected:** `modules/authorization/interfaces/permission.constants.ts`, `docs/38_RBAC_ARCHITECTURE.md`.
- **Current Status:** Frozen. Two deferred "Future Enhancement" splits are documented (not implemented): `settings.view`/`settings.manage` (`38_RBAC_ARCHITECTURE.md`, `39_SETTINGS_ARCHITECTURE.md`) — no equivalent `users.view` split has been documented yet as of Milestone 7.

### Conflict: Role hierarchy — how much inheritance to model

- **Milestone:** 5
- **Conflict:** The milestone brief's hierarchy diagram only showed one linear chain (Super Admin → Administrator → Editor → Author → Contributor); the other 6 system roles (Moderator, SEO Manager, Ads Manager, Analytics Viewer, Subscriber, Guest) had no specified inheritance relationship.
- **Reason:** Inventing inheritance for the other 6 roles would be unspecified business logic, not something the brief actually asked for.
- **Decision:** Model only the one diagrammed chain; the other 6 are standalone leaves with no inheritance.
- **Resolution:** `ROLE_HIERARCHY` map in `interfaces/role-hierarchy.ts` reflects exactly this — a deliberate, documented non-invention rather than a gap.
- **Files Affected:** `modules/authorization/interfaces/role-hierarchy.ts`, `docs/38_RBAC_ARCHITECTURE.md`.
- **Current Status:** Resolved and frozen.

### Conflict: Authorization caching — implement now or defer?

- **Milestone:** 5
- **Conflict:** Every `AuthorizationService` call re-queries the database (no caching), which is a real performance cost at scale.
- **Reason:** `40_PRODUCT_PHILOSOPHY.md` Principle 5 (interface before implementation) again — no real, immediate need was established for caching at Milestone 5's scope.
- **Decision:** Define `AuthorizationCacheProvider` as an interface only (`get`/`set`/`invalidate`), zero implementation, zero DI binding.
- **Resolution:** Every permission/role resolution hits PostgreSQL directly through Milestone 7.
- **Files Affected:** `modules/authorization/providers/authorization-cache.provider.ts`, `docs/38_RBAC_ARCHITECTURE.md`.
- **Current Status:** Unresolved by design — still interface-only.

---

## Milestone 6 — Settings & System Configuration Foundation

### Conflict: Feature Flags storage — reversal of the Milestone 2 rejection

- **Milestone:** 6
- **Conflict:** `35_ARCHITECTURE_FREEZE.md` and `36_DATABASE_FREEZE.md` both explicitly rejected a dedicated `feature_flags` table for V1 (see Milestone 2 entry above). Milestone 6's brief explicitly required: "Move all feature flags to the settings architecture. Feature flags must be runtime configurable."
- **Reason:** The original rejection was about _not building a bespoke table_; it predated the existence of a generic `Setting` table that could hold flag values without that bespoke schema.
- **Decision:** Store feature flags as rows in the already-frozen, generic `Setting` table under `SettingCategory.FEATURE_FLAGS` — no new table created, so the rejection's letter is preserved even though its intent (static/env-only) is reversed.
- **Resolution:** `FeatureFlagsService.isEnabled()`/`getAll()` now resolve through `SettingsService.resolveValue()` (both methods became `async`; zero prior consumers existed, confirmed by a repo-wide search, so this was a safe signature change). `FEATURE_*_ENABLED` env vars remain the fallback tier via each flag's `envKey`. `35_ARCHITECTURE_FREEZE.md` and `36_DATABASE_FREEZE.md` were both updated in the same change to record the reversal.
- **Files Affected:** `core/feature-flags/feature-flags.service.ts`, `modules/settings/settings.constants.ts` (FEATURE_FLAGS category), `docs/35_ARCHITECTURE_FREEZE.md`, `docs/36_DATABASE_FREEZE.md`, `docs/39_SETTINGS_ARCHITECTURE.md`.
- **Current Status:** Resolved. This is the canonical "Feature Flags storage" decision referenced by later milestones.

### Conflict: No columns exist for setting type/validation/metadata

- **Milestone:** 6
- **Conflict:** The Settings brief required rich per-setting metadata (type, validation rules, default value, hidden/read-only/encrypted flags) but the frozen `Setting` table has only `namespace`, `key`, `value: Json`.
- **Reason:** Adding columns would violate the schema freeze (`36_DATABASE_FREEZE.md`).
- **Decision:** Keep all metadata as a static, code-level closed-vocabulary registry (`SETTING_DEFINITIONS`); the database stores only the actual override value per key.
- **Resolution:** `namespace` maps to `SettingCategory`, `key` to the setting key, `value` to the override only — mirrored one milestone later by Users' `User.metadata` strategy (see Milestone 7 below).
- **Files Affected:** `modules/settings/settings.constants.ts`, `modules/settings/interfaces/setting-definition.interface.ts`, `docs/39_SETTINGS_ARCHITECTURE.md`.
- **Current Status:** Resolved and frozen (pending final approval).

### Conflict: Settings module naming

- **Milestone:** 6
- **Conflict:** `20_BACKEND_ARCHITECTURE.md` §4's module list names a planned `modules/config/`, but the milestone brief's own class names (`SettingsModule`, `SettingsController`, etc.) all say "Settings."
- **Reason:** "Settings" more precisely names what was actually built; `modules/config/` would collide conceptually with the pre-existing `src/config/` (env-based `ConfigModule`), a different and already-implemented thing.
- **Decision:** Implement as `modules/settings/`; treat it as the fulfillment of the originally-planned `modules/config/` line item under a corrected name.
- **Resolution:** `35_ARCHITECTURE_FREEZE.md`'s Final Module List updated to note the correspondence.
- **Files Affected:** `docs/35_ARCHITECTURE_FREEZE.md`, `modules/settings/*`.
- **Current Status:** Resolved and frozen.

### Conflict: Global settings uniqueness — the "NULL is not equal to NULL" gap

- **Milestone:** 6, clarified further in a stabilization patch
- **Conflict:** The partial unique indexes on `(site_id, namespace, key)`/`(tenant_id, namespace, key)` WHERE `deleted_at IS NULL` do not protect `Setting` rows where `site_id`/`tenant_id` are `NULL` — exactly the case for `SettingScope.GLOBAL` — because SQL/PostgreSQL treats every `NULL` as distinct from every other `NULL` in a unique index.
- **Reason:** ORM/database limitation discovered after the Milestone 3.1 partial-index strategy was frozen; not something a schema change could fix without a new migration (out of scope).
- **Decision:** Enforce Global-scope uniqueness at the application layer only — `SettingsRepository` always does find-then-upsert by composite key, never a blind insert.
- **Resolution:** Documented explicitly, including the residual gap (a raw SQL insert bypassing the repository, or a race between the find and the write, could still create a duplicate). A dedicated "Global Settings Resolution" section was added to `39_SETTINGS_ARCHITECTURE.md` in a later stabilization patch, spelling out the SQL-standard reasoning and two undecided future options (a coalesced generated column, or a serializable transaction/advisory lock).
- **Files Affected:** `modules/settings/repositories/settings.repository.ts`, `docs/39_SETTINGS_ARCHITECTURE.md` ("Global Settings Resolution" section).
- **Current Status:** Known, documented, unresolved at the database level by design (out of scope without a new migration). This is the canonical "Global settings uniqueness" reference for later milestones' analogous gaps (see Milestone 7's Email Uniqueness entry).

### Conflict: Settings permission split — deferred, not implemented

- **Milestone:** 6, extended in a stabilization patch
- **Conflict:** Every Settings endpoint (read and write) requires the single `settings.manage` permission; no `settings.view` exists.
- **Reason:** `PERMISSIONS` is frozen at 21 keys (Milestone 5); adding a new one requires updating `38_RBAC_ARCHITECTURE.md` in the same change, which wasn't warranted for a foundation milestone.
- **Decision:** Document the split as a future Enterprise Edition enhancement, explicitly deferred and explicitly not part of the frozen vocabulary.
- **Resolution:** "Future Enhancement — Settings Permission Split (Deferred, Not Implemented)" sections added to both `38_RBAC_ARCHITECTURE.md` and `39_SETTINGS_ARCHITECTURE.md` in a stabilization patch, worded identically to avoid drift between the two docs.
- **Files Affected:** `docs/38_RBAC_ARCHITECTURE.md`, `docs/39_SETTINGS_ARCHITECTURE.md`.
- **Current Status:** Deferred. Not implemented. Not part of the frozen vocabulary.

### Conflict: Prisma datasource hardening (`directUrl`)

- **Milestone:** Stabilization patch (post-6, pre-7)
- **Conflict:** `prisma migrate status`/deploy commands hang indefinitely against the Supabase pooler connection string (port 6543, PgBouncer transaction-pooling mode), which doesn't support the session-level advisory lock Prisma's migrate commands need.
- **Reason:** Not a credentials or network problem (confirmed via direct TCP connection tests and a raw SQL query) — a known Supabase+Prisma limitation specific to transaction-mode pooling.
- **Decision:** Add `directUrl = env("DIRECT_URL")` to the datasource block so CLI tooling can route through the direct (session-mode, port 5432) connection while the running application keeps using the pooled `DATABASE_URL`.
- **Resolution:** One-line, additive datasource change; no models/enums/generator touched. Verified working: `prisma migrate status` via the direct URL returned "3 migrations found... up to date" instantly.
- **Files Affected:** `config/prisma/schema.prisma` (datasource block only), `config/env/*.env` (added `DIRECT_URL`).
- **Current Status:** Resolved.

---

## Milestone 7 — User Management Foundation

### Conflict: Metadata JSON decision — no profile/preferences columns

- **Milestone:** 7
- **Conflict:** The brief required ~16 profile/preference fields (firstName, lastName, phone, bio, website, timezone, language, country, city, dateFormat, timeFormat, profileVisibility, theme, editorPreference, dashboardPreference, notificationPreference, accessibilityPreference); none exist as columns on the frozen `User` model, and none are documented in `41_PLATFORM_CAPABILITIES.md`.
- **Reason:** Schema is frozen (`36_DATABASE_FREEZE.md`); adding columns requires a new migration, out of scope for a foundation milestone.
- **Decision:** Reuse the existing generic `User.metadata: Json?` column, exactly mirroring Settings' Milestone 6 strategy of using an existing generic JSON column instead of new schema.
- **Resolution:** `UserMetadata { profile?, preferences?, security? }` interface defines the JSON shape; `UsersService` merges partial patches into it on `PATCH /users/me/profile`/`/preferences`.
- **Files Affected:** `modules/users/interfaces/user-metadata.interface.ts`, `modules/users/services/users.service.ts`, `docs/42_USER_MANAGEMENT_ARCHITECTURE.md`.
- **Current Status:** Resolved. This is the canonical "Metadata JSON decision" reference, alongside Settings' analogous `Setting.value` reuse.

### Conflict: UserStatus decision — frozen enum has no LOCKED or DELETED

- **Milestone:** 7
- **Conflict:** The frozen `UserStatus` enum is exactly `ACTIVE | INACTIVE | SUSPENDED | PENDING`. The milestone brief's own "USER STATUS" section listed six values including `LOCKED` and `DELETED`, while also instructing "Respect the frozen database enum. Do NOT invent new statuses" — a self-contradiction.
- **Reason:** Favoring the more explicit, doubly-stated instruction ("do not invent new statuses") over the enumerated list that included values the enum doesn't have.
- **Decision:** `DELETED` maps to the existing `deletedAt`/`deletedBy` soft-delete columns (the same pattern every other frozen table in this schema uses) rather than a status value. `LOCKED` maps to `metadata.security.locked` (see Metadata JSON decision above) rather than a status value.
- **Resolution:** `lockUser()`/`unlockUser()` toggle `metadata.security`, not `status`; `softDeleteUser()`/`restoreUser()` toggle `deletedAt`, not `status`. Explicitly documented limitation: a locked flag does not by itself block login — enforcing that would require editing Identity's frozen `AuthService`/`JwtStrategy`, deliberately not done in this milestone.
- **Files Affected:** `modules/users/services/users.service.ts`, `modules/users/interfaces/user-metadata.interface.ts`, `docs/42_USER_MANAGEMENT_ARCHITECTURE.md` ("User Status Conflict" section).
- **Current Status:** Resolved, with one documented, deliberate residual limitation (locking doesn't block login yet).

### Conflict: Email/username uniqueness — no database constraint despite docs claiming one

- **Milestone:** 7
- **Conflict:** `31_DATABASE_TABLES.md` (lines 21–22) claims `email UNIQUE` and per-site-scoped uniqueness. A full-schema grep confirms neither exists — the only `@unique`/`@@unique` in the entire schema is on `ArticleRevision`.
- **Reason:** Genuine doc/schema drift predating this milestone, discovered during the Milestone 7 audit, not something introduced by this milestone.
- **Decision:** Enforce uniqueness at the application layer only (`UsersRepository.findByEmail`/`findByUsername`, checked before create/update in `UsersService`), the same pattern and the same residual race-condition caveat as Settings' Global-scope uniqueness gap (Milestone 6).
- **Resolution:** Documented as a known gap rather than silently assumed fixed; a real migration adding `@@unique` constraints is the eventual fix, out of scope here.
- **Files Affected:** `modules/users/repositories/users.repository.ts`, `modules/users/services/users.service.ts`, `docs/42_USER_MANAGEMENT_ARCHITECTURE.md` ("Schema/Docs Conflict" section).
- **Current Status:** Known, documented, unresolved at the database level. Cross-references the Milestone 6 "Global settings uniqueness" gap as the same category of issue.

### Conflict: Identity module freeze — how to reuse without editing

- **Milestone:** 7
- **Conflict:** The brief required reusing `PasswordService` (hashing), `SessionService`/`SessionRepository`/`RefreshTokenRepository` (sessions/tokens) from Identity, but `IdentityModule` exports only `JwtAuthGuard`, `OptionalAuthGuard`, `JwtModule` — none of the classes actually needed. Identity is frozen (`37_IDENTITY_FREEZE.md`).
- **Reason:** Adding exports to `IdentityModule` would mean editing a frozen file; not adding them would force duplicating password-hashing/session logic, which the brief explicitly forbade ("Do NOT duplicate hashing logic").
- **Decision:** Import `IdentityModule` into `UsersModule` (for its exported `JwtModule`, needed transitively by `TokenService`), then **re-provide** the exact same `PasswordService`/`TokenService`/`SessionService`/`SessionRepository`/`RefreshTokenRepository` classes as `UsersModule`'s own providers — same code, zero duplication, zero edits to any Identity file.
- **Resolution:** Verified via unit tests that these are literally the same classes (imported directly, not reimplemented). Identity's own `UserRepository` (auth-scoped, explicitly documents itself as not general CRUD) was left untouched; a separate, new `UsersRepository` was created instead.
- **Files Affected:** `modules/users/users.module.ts`, `docs/42_USER_MANAGEMENT_ARCHITECTURE.md` ("Reuse Strategy" section).
- **Current Status:** Resolved. This is the canonical "Identity module freeze" / reuse-pattern reference for any future module needing Identity's services.

### Conflict: Session strategy — listing/finding sessions Identity's repository doesn't support

- **Milestone:** 7
- **Conflict:** `GET /users/:id/sessions` (list) and `terminateSession()` (needs to look up a session by id to find its `refreshTokenId`) require queries Identity's frozen `SessionRepository` doesn't expose (`findAllForUser`, `findById` — it only has `create`, `findActiveByRefreshTokenId`, `revoke`, `revokeAllForUser`, `updateLastSeen`).
- **Reason:** Identity's `SessionRepository` was scoped to exactly what the auth flow needs; listing/lookup-by-id were never required until Users needed them.
- **Decision:** Create a new, read-only `UserSessionsRepository` in the Users module for just those two queries, rather than adding methods to Identity's frozen repository file. Actual revocation still goes through Identity's real `SessionRepository.revoke()`/`RefreshTokenRepository.revoke()` (re-provided, per the Identity-module-freeze decision above).
- **Resolution:** Zero edits to any Identity file; `UserSessionsRepository` is purely additive, new code.
- **Files Affected:** `modules/users/repositories/user-sessions.repository.ts`, `docs/42_USER_MANAGEMENT_ARCHITECTURE.md` ("Reuse Strategy", "Session Flow" sections).
- **Current Status:** Resolved.

### Conflict: Audit Logger limitation — log lines, not durable audit trail

- **Milestone:** 7 (surfaced; the limitation itself dates to Milestone 2.1's `AuditLoggerService`)
- **Conflict:** The Users brief asked for audit integration on sensitive actions (create, delete, lock/unlock, password changes, etc.). `AuditLoggerService.record()` only emits structured Pino log lines — it does not write to the `AuditLog` Prisma model, despite that model existing in the schema (referenced via `User.auditLogs`).
- **Reason:** `AuditLoggerService`'s own Milestone 2.1 doc comment states DB persistence is deferred to a future, dedicated Audit business module — this was a pre-existing, documented limitation, not something Milestone 7 could or should silently "fix" by adding ad-hoc persistence code outside that future module's scope.
- **Decision:** Call `AuditLoggerService.record()`/`SecurityLoggerService.record()` for every sensitive Users action, exactly mirroring the existing pattern `auth.service.ts` and `global-exception.filter.ts` already use, while explicitly documenting that this is log-only, not a durable audit trail.
- **Resolution:** No new persistence code was added; the limitation is called out explicitly in `docs/42_USER_MANAGEMENT_ARCHITECTURE.md` rather than left implicit.
- **Files Affected:** `modules/users/services/users.service.ts`, `docs/42_USER_MANAGEMENT_ARCHITECTURE.md` ("Security" section).
- **Current Status:** Known, documented, unresolved by design — durable audit persistence remains a future Audit module's responsibility.

### Conflict: Event Bus foundation — interfaces exist, nothing implements them

- **Milestone:** 7 (the interfaces themselves date to earlier scaffolding; Milestone 7 is the first module that considered actually using them)
- **Conflict:** The brief asked Users to integrate with "Existing Event interfaces." `core/interfaces/event-bus.interface.ts`/`events.interface.ts` (`EventBus`, `DomainEvent`, `EventPublisher`) are pure TypeScript interfaces — zero implementation, zero DI provider, confirmed via a full-repository search.
- **Reason:** No queue/Redis/pub-sub adapter has been implemented anywhere in the codebase yet; there is nothing to publish an event into.
- **Decision:** Do not fabricate a working event bus or a fake no-op call that looks like functionality. Instead, name the exact points where a future `UserCreated`/`UserUpdated`/etc. event would be published, without any code depending on an unimplemented interface.
- **Resolution:** `docs/42_USER_MANAGEMENT_ARCHITECTURE.md`'s "Security" section lists the hook points (after create/update/delete/restore/lock/unlock/activate/deactivate/password changes) by name; zero lines of code reference `EventBus`/`DomainEvent`.
- **Files Affected:** `docs/42_USER_MANAGEMENT_ARCHITECTURE.md` (documentation only — no source file changed).
- **Current Status:** Known, documented, unresolved by design. This is the canonical "Event Bus foundation" reference for any future milestone (e.g. the user-proposed `43_PLATFORM_EVENTS.md` — see Recommendations, below) that wants to actually implement one.

### Conflict: Permission vocabulary freeze applied to Users — no split, and one self-service carve-out

- **Milestone:** 7
- **Conflict:** Only `users.manage` exists in `PERMISSIONS` (no `users.view`/`users.create`/`users.delete`). Some Users endpoints (`/users/me*`, and `/users/:id/change-password` when acting on one's own id) are inherently self-service and shouldn't require an admin-only permission.
- **Reason:** Adding new permission keys was explicitly disallowed by the brief ("If a required permission is missing, STOP, Report it. Do NOT silently add it.").
- **Decision:** Gate all other `/users`/`/users/:id/*` endpoints with `users.manage`; gate self-service endpoints with authentication only (mirroring `AuthorizationController.getMyAuthorization()`'s Milestone 5 precedent); special-case `change-password` with a manual `id === currentUser.id` ownership check instead of a permission decorator.
- **Resolution:** No permission added. Design documented in `docs/42_USER_MANAGEMENT_ARCHITECTURE.md`'s "Permission Conflict" section.
- **Files Affected:** `modules/users/controllers/users.controller.ts`, `docs/38_RBAC_ARCHITECTURE.md`, `docs/42_USER_MANAGEMENT_ARCHITECTURE.md`.
- **Current Status:** Resolved as designed. A future `users.view` split remains undocumented/undecided (unlike Settings' explicit deferred-split note) — see Recommendations.

---

## Milestone 8 — Content / Articles Foundation

_(Added in the post-Milestone-12 stabilization patch. Full conflict list: `docs/46_ARTICLES_ARCHITECTURE.md` "Conflicts Found," 8 entries — the 3 most significant are summarized here.)_

### Conflict: Article authorship is indirect (`Article.authorId` → `Author.id`, not `User.id`)

- **Conflict:** `ArticlePolicySubject` (frozen, interface-only at Milestone 5) had no way to express "does this article's author correspond to the acting user," since `Article.authorId` points at an `Author` row, and `Author.userId` is itself optional.
- **Root Cause:** No Authors CRUD module exists yet; the frozen schema models authorship through a separate `Author` entity rather than directly through `User`.
- **Resolution:** Added `authorUserId: string | null` to `ArticlePolicySubject` — an additive, minimal extension explicitly anticipated by that interface's own "future subject shape once the Articles module exists" comment. `ArticleOwnershipPolicy` is constructed per-request with the actor's id closed over.
- **Status:** Resolved.
- **Future Impact:** Any future Authors CRUD/linking UI must keep populating `authorUserId` consistently for ownership checks to keep working.
- **Documentation Updated:** `docs/46_ARTICLES_ARCHITECTURE.md`, `modules/authorization/policies/article.policy.ts`.

### Conflict: No `article.view`/`article.restore` permission exists

- **Conflict:** Reads and restore have no dedicated permission in the frozen `PERMISSIONS` vocabulary (only `article.create`/`update`/`delete`/`publish`).
- **Root Cause:** `PERMISSIONS` was frozen at Milestone 5 before Articles (the first content module) existed, so no read/restore-specific key was anticipated.
- **Resolution:** Reads gated via `RequireAnyPermission` across the 4 existing article permissions; restore reuses `article.delete`.
- **Status:** Resolved as designed; deferred split documented, not implemented.
- **Future Impact:** Same class of gap as Settings/Users/SEO's deferred `*.view` splits — a candidate for the combined future "RBAC fine-graining" milestone (see Recommendations).
- **Documentation Updated:** `docs/46_ARTICLES_ARCHITECTURE.md`.

### Conflict: `SeoMeta` isn't a true 1:1 with `Article` at the schema level

- **Conflict:** `SeoMeta` has no back-reference to the `Article` that owns it — only `Article.seoMetaId` points at it — so nothing in the schema prevents two Articles pointing at the same `SeoMeta` row.
- **Root Cause:** Frozen schema design; `SeoMeta` is a generic, entity-agnostic table shared by Article/Category/Page.
- **Resolution:** Enforced as 1:1 at the application layer only — each article's SEO fields upsert its own row via `ArticlesRepository.upsertSeoMeta()`, never shared.
- **Status:** Resolved at the application layer; no DB constraint exists.
- **Future Impact:** Directly relevant to Milestone 12's "Three SEO Write Paths" finding — the same table now has a third, independent write path (the standalone SEO module) with no cross-awareness of this 1:1 assumption.
- **Documentation Updated:** `docs/46_ARTICLES_ARCHITECTURE.md`; cross-referenced in `docs/51_SEO_ARCHITECTURE.md`.

---

## Milestone 9 — Category & Tag Foundation

_(Added in the post-Milestone-12 stabilization patch. Full conflict list: `docs/47_CATEGORY_TAG_ARCHITECTURE.md` "Conflicts Found," 8 entries — the 3 most significant are summarized here.)_

### Conflict: No `category.update`/`category.delete`/any `tag.*` permission exists

- **Conflict:** Only `category.create` exists in the frozen vocabulary; Categories and Tags share no dedicated permission set for any other action.
- **Root Cause:** Same frozen-vocabulary constraint as Articles — Categories/Tags weren't anticipated at Milestone 5.
- **Resolution:** Every endpoint on both resources (read and write) reuses `category.create` — "one coarse permission for the whole resource," the same pattern Settings established.
- **Status:** Resolved as designed.
- **Future Impact:** Same deferred-split class as Articles/Settings/Users/SEO.
- **Documentation Updated:** `docs/47_CATEGORY_TAG_ARCHITECTURE.md`.

### Conflict: `Tag` has no `color` field; `Category` has no `visibility`/generic metadata field

- **Conflict:** The milestone brief asked for Tag Color and Category Visibility; neither column exists on the frozen schema, and (unlike `MediaAsset`/`User`/`Setting`) neither model has a generic JSON metadata column to reuse instead.
- **Root Cause:** Frozen schema simply doesn't have these columns or an escape hatch for them.
- **Resolution:** Not implemented — explicitly reported as not implemented rather than faked via an invented column or a misused unrelated field.
- **Status:** Resolved (correctly not implemented, not silently dropped).
- **Future Impact:** Requires a real migration if ever built — out of scope until the schema freeze is revisited.
- **Documentation Updated:** `docs/47_CATEGORY_TAG_ARCHITECTURE.md`.

### Conflict: `Category.name`/`Tag.name` uniqueness is application-layer-only, and was undisclosed until the Final Backend Audit

- **Conflict:** Only `slug` received a DB-level partial unique index in the freeze migration; `name` uniqueness is checked only in the service layer (`assertNameAvailable`), and — unlike the equivalent, disclosed User email/Settings Global-scope gaps — this was never called out in `47_CATEGORY_TAG_ARCHITECTURE.md` itself.
- **Root Cause:** An oversight in Milestone 9's own conflict reporting — the same category of gap Settings (Milestone 6) and Users (Milestone 7) both correctly disclosed was missed for Categories/Tags.
- **Resolution:** Surfaced by the Final Backend Architecture Audit (post-Milestone-12, Medium/High-tier finding). **Updated in the following stabilization patch** (Task 1 of that patch's approved scope: "Category/Tag Name uniqueness — either add a DB constraint, or keep application-layer uniqueness and document it everywhere consistently") — Decision B was chosen: keep application-layer-only uniqueness (no migration), and disclose it consistently. No code/schema/migration changed.
- **Status:** Known, documented consistently (as of the second stabilization patch); unresolved at the database level by deliberate decision, not oversight.
- **Future Impact:** A future migration adding a partial unique index on `(site_id, name)` WHERE `deleted_at IS NULL` would close this, mirroring the pattern already used for slug/email/storageKey — not prioritized now.
- **Documentation Updated:** This entry (`docs/43`), and — in the follow-up stabilization patch — `docs/47_CATEGORY_TAG_ARCHITECTURE.md` itself (new Conflict #9 and an updated "Validation" table row), closing the Documentation Gap this entry originally flagged as outstanding.

---

## Milestone 10 — Media Library Foundation

_(Added in the post-Milestone-12 stabilization patch. Full conflict list: `docs/48_MEDIA_LIBRARY_ARCHITECTURE.md` "Conflicts Found," 10 entries — the 3 most significant are summarized here.)_

### Conflict: `MediaAsset` has no folder-linkage field, no display-name column, no content-hash column

- **Conflict:** The brief required folder assignment, a rename operation, and duplicate detection; none of the three has a natural column on the frozen `MediaAsset` model.
- **Root Cause:** Frozen schema constraints, predating this milestone.
- **Resolution:** `folderId` stored in the existing generic `MediaAsset.metadata` JSON column (same JSON-reuse pattern as Settings/Users); "rename" updates `metadata.filename`, `storageKey` never mutated; duplicate detection is heuristic (`mimeType`+`filesize` match), explicitly not exact/hash-based.
- **Status:** Resolved via JSON-column reuse.
- **Future Impact:** A real `folderId` FK and a content-hash column remain candidate future migrations if exact duplicate detection or relational folder queries are ever needed.
- **Documentation Updated:** `docs/48_MEDIA_LIBRARY_ARCHITECTURE.md`.

### Conflict: No `media.view`/`media.restore` permission exists

- **Conflict:** Same frozen-vocabulary constraint as every other content module.
- **Root Cause:** `PERMISSIONS` frozen at Milestone 5.
- **Resolution:** Reads use `RequireAnyPermission(media.upload, media.delete)`; restore reuses `media.delete`.
- **Status:** Resolved as designed.
- **Future Impact:** Same deferred-split class as Articles/Categories/Settings/Users/SEO.
- **Documentation Updated:** `docs/48_MEDIA_LIBRARY_ARCHITECTURE.md`.

### Conflict: `StorageProvider`/`CacheProvider` interfaces exist with zero implementation or DI binding

- **Conflict:** The brief implies real file storage; no concrete storage backend has ever been wired into the DI container.
- **Root Cause:** `40_PRODUCT_PHILOSOPHY.md` Principle 5 ("interface before implementation") — no real, immediate need was established for a concrete provider at Milestone 10's scope; this remains true through Milestone 12.
- **Resolution:** Neither interface is injected anywhere; deleting a `MediaAsset` only ever soft-deletes the DB row — no actual object-storage interaction occurs anywhere in the codebase.
- **Status:** Unresolved by design — interface-only.
- **Future Impact:** A real R2/S3/MinIO implementation is the natural next step once an actual file-upload engine is built (also not yet implemented).
- **Documentation Updated:** `docs/48_MEDIA_LIBRARY_ARCHITECTURE.md`.

---

## Milestone 11 — Comments & Discussion Foundation

_(Added in the post-Milestone-12 stabilization patch. Full conflict list: `docs/49_COMMENTS_ARCHITECTURE.md` "Conflicts Found," 13 entries — the 3 most significant are summarized here.)_

### Conflict: No `comment.create`/`update`/`delete`/`restore` permission exists — only `comment.moderate`

- **Conflict:** Gating comment _creation_ behind a moderator-tier permission would prevent the very readers/authors the brief's "Author" ownership tier describes from ever commenting.
- **Root Cause:** Frozen `PERMISSIONS` vocabulary has exactly one comment-related key.
- **Resolution:** Self-service create/read/update-own/delete-own/restore-own gated by the existing global `JwtAuthGuard` only (mirroring the Users module's self-service precedent from Milestone 7); only Approve/Reject/Spam are gated by the real `comment.moderate` permission.
- **Status:** Resolved as designed — this is now the reference pattern (self-service vs. moderator-tier) for any future user-generated-content module.
- **Future Impact:** None expected; the pattern is stable and reusable.
- **Documentation Updated:** `docs/49_COMMENTS_ARCHITECTURE.md`.

### Conflict: `docs/50_V1_PRODUCT_SCOPE.md` reported missing — later found to be misdiagnosed

- **Conflict:** Rule Zero's required-reading list names `docs/50_V1_PRODUCT_SCOPE.md`; an exact-filename `ls docs/` found no match, so Milestone 11 (and later Milestone 12) reported it as a known-missing dependency.
- **Root Cause:** The document's content existed the entire time under a typo'd filename, `docs/product scop.md` (its own first line literally read `# 50_V1_PRODUCT_SCOPE.md`, status `FROZEN`) — an exact-filename check cannot catch a misnamed file.
- **Resolution:** Caught by the Final Backend Architecture Audit (post-Milestone-12) via a full-content read rather than a filename match. File renamed to `docs/50_V1_PRODUCT_SCOPE.md` in this same stabilization patch, zero content changes.
- **Status:** **RESOLVED** — previously misreported as an open conflict across two milestone docs (49, 51); now closed.
- **Future Impact:** None — the document now resolves at the expected path for all future Rule Zero required-reading checks.
- **Documentation Updated:** `docs/49_COMMENTS_ARCHITECTURE.md`, `docs/51_SEO_ARCHITECTURE.md`, `docs/50_V1_PRODUCT_SCOPE.md` (renamed), this entry.

### Conflict: Comment tree utility not built on the generic `HierarchyNode<T>` utility (Categories/Media's genericized tree util)

- **Conflict:** Reuse was the established precedent (Media genericized Categories' tree utility one milestone earlier), but `HierarchyNode` requires `name`/`slug` fields `Comment` doesn't have.
- **Root Cause:** `Comment`'s shape is genuinely different from Category/MediaFolder's — forcing fake `name`/`slug` fields onto it to fit the generic utility would be worse than a small amount of duplication.
- **Resolution:** A small, Comment-specific equivalent (`utils/comment-tree.util.ts`) was written instead of extending the shared generic further.
- **Status:** Resolved as designed — a deliberate, documented non-reuse decision.
- **Future Impact:** None; correct engineering call, not a gap.
- **Documentation Updated:** `docs/49_COMMENTS_ARCHITECTURE.md`.

---

## Milestone 12 — SEO & Metadata Engine Foundation

### Conflict: SEO permission split — deferred, not implemented

- **Milestone:** 12, recorded in a stabilization patch
- **Conflict:** Every `modules/seo/` endpoint (create/read/update/delete/restore/upsert/preview/validate/lookup) requires the single `seo.manage` permission; no `seo.view`/`seo.create`/`seo.update`/`seo.delete`/`seo.publish` split exists.
- **Reason:** `PERMISSIONS` is frozen (Milestone 5, currently 21 keys including `SEO_MANAGE: 'seo.manage'`); adding five new keys requires updating `38_RBAC_ARCHITECTURE.md` in the same change, which is not warranted for a foundation milestone and was explicitly out of scope for a stabilization patch ("Do NOT modify permissions").
- **Decision:** Document the split as a **future-only, not-implemented** enhancement, exactly mirroring the pattern already established for Settings (`settings.view`/`settings.manage`, Milestone 6) and Users (`users.view`, flagged in Milestone 7's Recommendations).
- **Resolution:** This entry, plus a cross-reference from `docs/51_SEO_ARCHITECTURE.md`'s Recommendations section. No code changed; no permission key was added to `modules/authorization/interfaces/permission.constants.ts`. If implemented in a future milestone, the five keys would be: `seo.view` (read-only access to all `GET`/`POST /seo/preview`/`POST /seo/validate` endpoints), `seo.create` (`POST /seo`), `seo.update` (`PATCH /seo/:id`, `POST /seo/upsert`), `seo.delete` (`DELETE /seo/:id`, `POST /seo/:id/restore`), and `seo.publish` — the last one named for parity with Articles' `article.publish` precedent (a separate editorial-tier action from a plain update), though `SeoMeta` has no publish/draft concept of its own today, so its exact meaning would need to be defined at the time this split is actually built, not assumed now.
- **Files Affected:** `docs/43_CONFLICT_RESOLUTION.md` (this entry), `docs/51_SEO_ARCHITECTURE.md` (Recommendations section).
- **Current Status:** Deferred. Not implemented. Not part of the frozen vocabulary.

_(The following three entries were added in the second Milestone 12 stabilization patch, post-Final-Backend-Audit.)_

### Conflict: Three independent write paths into `SeoMeta` (Articles, Categories, SeoModule)

- **Conflict:** Articles' and Categories' own frozen `upsertSeoMeta()` methods (gated by `article.update`/`category.create`) and this module's own generic CRUD (gated by `seo.manage`) all write to the same table with no cross-awareness of each other.
- **Root Cause:** The frozen schema has no ownership/lock concept on `SeoMeta` rows; Articles/Categories already had their own inline SEO-editing flow before the dedicated SEO module (this one) existed.
- **Resolution:** Documented explicitly as two deliberate permission tiers (editorial vs. administrative) over the same table, not silently papered over. No runtime guard prevents both paths from touching the same row.
- **Status:** Known, documented, unresolved by design — closing it would require either a schema change (an owning-entity back-pointer on `SeoMeta`) or a cross-module consistency mechanism (event bus), both out of scope for a foundation milestone.
- **Future Impact:** A future Entity Linking endpoint or event-bus-driven consistency check could close this gap — flagged as a Recommendation in `docs/51_SEO_ARCHITECTURE.md`.
- **Documentation Updated:** `docs/51_SEO_ARCHITECTURE.md` "Three SEO Write Paths (V1 Ownership)" section.

### Conflict: SEO canonical URL validator accepted non-http(s) pseudo-schemes

- **Conflict:** `SeoValidator.assertCanonicalUrl()` originally only checked "is this URL-shaped" (`new URL()` not throwing) — true for `javascript:`, `data:`, `vbscript:`, and `file:` URIs just as much as for `http(s):` ones.
- **Root Cause:** `new URL()` alone validates syntax, not scheme allow-listing; the original implementation conflated the two.
- **Resolution:** Found by the Final Backend Architecture Audit (High severity). Fixed in the post-audit stabilization patch: `assertCanonicalUrl` now requires `protocol === 'http:' || protocol === 'https:'` via a new, narrower `isHttpUrl()` helper used only by this one method — `openGraph`/`twitterCard` image/url validation is unchanged, since those were not the subject of the finding.
- **Status:** **RESOLVED.**
- **Future Impact:** None expected — closes the gap before any frontend ever renders a stored `canonicalUrl`.
- **Documentation Updated:** `docs/51_SEO_ARCHITECTURE.md` "Security" section and Conflict #1 resolution note; `apps/backend/src/modules/seo/validators/seo.validator.ts` and its spec.

### Conflict: `docs/43`/`44`/`45` found stale (self-dated "as of Milestone 7") by the Final Backend Architecture Audit

- **Conflict:** These three consolidation documents describe the system's module inventory, architecture diagrams, and freeze status as they stood after Milestone 7 — five milestones (Articles through SEO) out of date.
- **Root Cause:** No process existed to update these three consolidation docs at the same cadence as new milestone docs; they were written once and never revisited.
- **Resolution:** This document (`43`) is being brought current through Milestone 12 in this same stabilization patch; `44_SYSTEM_OVERVIEW.md` and `45_PROJECT_FREEZE_V1.md` are being refreshed in the same patch.
- **Status:** **RESOLVED** (within this same patch).
- **Future Impact:** Process reminder for future milestones: update `43`/`44`/`45` incrementally alongside each new milestone doc rather than batching a large retroactive refresh.
- **Documentation Updated:** `docs/43_CONFLICT_RESOLUTION.md` (this file), `docs/44_SYSTEM_OVERVIEW.md`, `docs/45_PROJECT_FREEZE_V1.md`.

---

## Cross-Cutting Patterns (Appear in Multiple Milestones)

These aren't separate conflicts — they're the same resolution pattern reapplied, called out here so a future module author recognizes the precedent instead of re-deriving it:

1. **"No columns → reuse an existing generic JSON column"** — Settings reused `Setting.value`; Users reused `User.metadata`. Any future module hitting the same frozen-schema constraint should look for an existing generic JSON column before considering a migration.
2. **"NULL ≠ NULL breaks partial unique indexes at Global/unscoped rows"** — first found in Settings (Global scope), reconfirmed in Users (email/username, which aren't scoped at all). Any future uniqueness requirement on a nullable-scoped or unscoped column needs the same application-layer enforcement and the same documented caveat.
3. **"Reuse via re-provide, not via editing a frozen module's exports"** — Users reused Identity's `PasswordService`/`SessionService`/etc. this way. Any future module needing something a frozen module doesn't export should do the same rather than editing that module.
4. **"Report missing permissions/enum values instead of inventing them"** — applied consistently in Settings (no `settings.view`), Users (no `users.view`, no `LOCKED`/`DELETED` enum values), Articles/Categories/Media (no `*.view`/`*.restore` split each), Comments (no `comment.create`/`update`/`delete` split), and SEO (no `seo.view`/`seo.create`/`seo.update`/`seo.delete`/`seo.publish` split, Milestone 12).
5. **"App-layer-only uniqueness beyond the documented cases"** (added post-Milestone-12 audit) — beyond the disclosed Settings Global-scope and User email/username gaps, `Category.name`/`Tag.name` (Milestone 9) has the identical class of gap and was undisclosed until the Final Backend Architecture Audit caught it. Any future module author adding a "name" or similar free-text uniqueness field should check for a real DB constraint or explicitly disclose its absence in that milestone's own doc — don't assume slug-level uniqueness coverage extends to every unique-ish field.

## Recommendations

- Decide whether to patch Identity's `AuthService`/`JwtStrategy` so a locked user (`metadata.security.locked`) is actually rejected at login — currently only session revocation happens, not login prevention.
- Consider a follow-up migration adding real `@@unique` constraints for `User.email`/`username` and `Setting`'s Global scope, closing both documented application-layer-only gaps at once.
- If a `users.view`/`users.manage` split is ever wanted, implement it alongside the already-documented `settings.view`/`settings.manage` split in one combined RBAC-extension milestone, since both are structurally identical asks.
- The SEO permission split (`seo.view`/`seo.create`/`seo.update`/`seo.delete`/`seo.publish`, Milestone 12 entry above) is a third structurally-identical ask — a single future "RBAC fine-graining" milestone could resolve all three (`settings.*`, `users.*`, `seo.*`) splits together instead of three separate small migrations to `38_RBAC_ARCHITECTURE.md`.
- The user's proposed `docs/43_PLATFORM_EVENTS.md` (event architecture freeze) would give the "Event Bus foundation" conflict above somewhere concrete to resolve into — note that this document occupies number 43, so that future doc should be numbered **52** or later (the next free number after this document's own Milestone 12 patch, which already claims 51), not 42/43/46 as variously suggested at different points in this document's history.
- ~~Amend `docs/47_CATEGORY_TAG_ARCHITECTURE.md` to disclose the `Category.name`/`Tag.name` uniqueness gap directly~~ — **Done** in the follow-up stabilization patch (Task 1 of that patch's scope explicitly covered this).
- Keep this document, `44_SYSTEM_OVERVIEW.md`, and `45_PROJECT_FREEZE_V1.md` updated incrementally with each future milestone, per Cross-Cutting Pattern reminder — the five-milestone staleness gap this patch just closed should not recur.

## Approved Date

Pending — this document is part of the same stabilization patch as `44_SYSTEM_OVERVIEW.md`, `45_PROJECT_FREEZE_V1.md`, and `docs/README.md`, all awaiting approval together. Updated through Milestone 12 in a second stabilization patch, post-Final-Backend-Audit.

## Architecture Status

**DOCUMENTATION CONSOLIDATION — AWAITING APPROVAL.** Coverage extended through Milestone 12 (see Milestones 8–12 sections above); Milestones 2–7 unchanged from the original consolidation pass.
