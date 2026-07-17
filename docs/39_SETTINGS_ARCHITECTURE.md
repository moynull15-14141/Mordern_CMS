# 39_SETTINGS_ARCHITECTURE

## Executive Summary

Platform Settings & System Configuration Foundation (Milestone 6). Mirrors `37_IDENTITY_FREEZE.md`/`38_RBAC_ARCHITECTURE.md`'s role for their modules: from this point forward, `apps/backend/src/modules/settings/` is the literal implementation of what this document describes. **Foundation only** — no frontend, no Admin UI, no live AI/Email/Storage/Search/Redis/encryption implementation, no new business modules. Every future module (AI, Search, Email, Storage, Analytics, SEO) reads its runtime configuration through this system.

**Architecture Status at time of writing: awaiting approval** (per the milestone brief — implementation is complete and verified, but not yet marked FROZEN the way Milestones 3–5 are).

**Stabilization patch (post-Milestone-6, pre-Milestone-7):** clarified Global Settings uniqueness (see "Global Settings Resolution" below) and documented a deferred `settings.view`/`settings.manage` permission split (see "Future Enhancement" below). No code behavior changed by this patch beyond `config/prisma/schema.prisma`'s `datasource` block gaining `directUrl` — see Task 1 of the stabilization request.

## Module Identity

```
settings/
├── controllers/   — SettingsController (9 REST endpoints)
├── services/      — SettingsService (the single orchestrator; resolves the priority chain)
├── repositories/  — SettingsRepository (Prisma access to the existing `Setting` table)
├── validators/    — SettingsValidator (type + rule enforcement)
├── mappers/       — SettingsMapper (definition + resolved value -> SettingResponseDto, redaction)
├── interfaces/    — SettingDefinition, SettingValue, SettingsCacheInterface,
│                    SettingsHistoryInterface, SettingsEncryptionInterface (last three: interfaces only)
├── enums/         — SettingCategory, SettingType, SettingScope
├── dto/           — request/response contracts
├── exceptions/    — SettingNotFoundException, SettingReadOnlyException, SettingValidationException
└── settings.constants.ts — SETTING_DEFINITIONS, the closed-vocabulary registry
```

No schema change, no migration. The engine reads and writes exclusively the existing, frozen `Setting` table (`36_DATABASE_FREEZE.md`).

## Why No New Tables

`config/prisma/schema.prisma`'s `Setting` model already existed before this milestone (Milestone 3, frozen): `id, siteId?, tenantId?, namespace, key, value: Json` + audit sextuple, with partial unique indexes on `(siteId, namespace, key)` and `(tenantId, namespace, key)` WHERE `deleted_at IS NULL`. This milestone maps:

- `namespace` -> **category** (`SettingCategory` enum, 17 values)
- `key` -> the setting's key within its category
- `value` -> the stored override only; **never** the setting's type, validation rules, defaults, or flags

Everything else — type, label, description, default value, validation rules, `envKey`, `isReadOnly`, `isHidden`, `isEncrypted` — lives in `SETTING_DEFINITIONS`, a static, code-level, closed-vocabulary registry (`settings.constants.ts`). This is a deliberate mirror of the `PERMISSIONS` constant pattern in `38_RBAC_ARCHITECTURE.md`: the vocabulary is code, the assignment/override is data. `SettingsService` never accepts a `category.key` that isn't in the registry — an unrecognized key always raises `SettingNotFoundException`.

## Configuration Priority

```
Runtime Override   (in-process Map, SettingsService.setRuntimeOverride — no REST endpoint yet)
      ↓
Environment Variable   (SettingDefinition.envKey, e.g. FEATURE_AI_ENABLED)
      ↓
Database Setting   (Setting row for this category+key+scope)
      ↓
System Default   (SettingDefinition.defaultValue)
```

`SettingsService.resolveValue()` implements exactly this order for every read. This means an operator can still fully configure the platform via `config/env/*.env` alone (matching `40_PRODUCT_PHILOSOPHY.md` Principle 4, "Configuration over hardcoding") — the database tier is additive, not a replacement for env-based configuration.

## Setting Categories (17)

General, Site, Localization, Security, Authentication, Media, SEO, Comments, Analytics, Email, Storage, Search, AI, Performance, Feature Flags, System, Developer — see `SettingCategory` enum. Each is a `Setting.namespace` value.

## Setting Types (12)

STRING, TEXT, NUMBER, BOOLEAN, JSON, ARRAY, COLOR, URL, EMAIL, PASSWORD, SECRET, FILE_REFERENCE — see `SettingType` enum. `PASSWORD`/`SECRET` values (and any definition with `isEncrypted: true`) are redacted (`null`) in every read/export response by default — `SettingsMapper.toResponseDto()`'s `reveal` option is only set internally by `updateSetting()`'s own return value, never by a GET.

## Setting Scope

`SettingScope.GLOBAL | SITE | TENANT`, mapping directly onto the existing nullable `Setting.siteId`/`Setting.tenantId` columns. Only `GLOBAL` is exercised by this milestone's endpoints (no site/tenant routing parameter is exposed yet) — architecture only, no multi-tenancy behavior, per the milestone brief.

## Validation

`SettingsValidator` enforces, per `SettingDefinition.validation`: `required`, `nullable`, `min`/`max` (numeric range or string length), `regex`, `allowedValues`, plus a type-specific check for every `SettingType` (e.g. `EMAIL` regex, `URL` parseability, `COLOR` hex format, `ARRAY`/`JSON` shape). A read-only definition (`isReadOnly: true`) always rejects writes via `SettingReadOnlyException`, checked before value validation.

## Global Settings Resolution — Application-Layer Uniqueness

**Global uniqueness is currently enforced by `SettingsService` + `SettingsRepository`. It is NOT enforced by PostgreSQL.** This is documented explicitly here (stabilization patch, post-Milestone-6) because it is easy to assume the database's partial unique indexes cover every scope, and they do not cover Global.

### Why the PostgreSQL unique constraint is insufficient

`36_DATABASE_FREEZE.md`'s partial unique indexes on the `Setting` table are:

```sql
CREATE UNIQUE INDEX "settings_site_id_namespace_key_active_key"
  ON "settings"("site_id", "namespace", "key") WHERE "deleted_at" IS NULL;
CREATE UNIQUE INDEX "settings_tenant_id_namespace_key_active_key"
  ON "settings"("tenant_id", "namespace", "key") WHERE "deleted_at" IS NULL;
```

Per the SQL standard (and PostgreSQL's implementation of it), **NULL is never considered equal to another NULL** for the purpose of a unique index. A unique index on `(site_id, namespace, key)` only rejects a _second_ row when `site_id` is a non-NULL value that repeats. When `site_id IS NULL` — exactly the case for `SettingScope.GLOBAL`, since Global settings have both `siteId` and `tenantId` null — PostgreSQL treats every row's `NULL` as a distinct value from every other row's `NULL`, so **any number of rows** with `site_id = NULL, namespace = 'general', key = 'siteName'` can coexist without violating either partial unique index. The same reasoning applies identically to the `tenant_id` index. Global scope is therefore the one case neither index actually protects.

### Current strategy (application layer)

`SettingsRepository` never performs a blind `INSERT`. Every write goes through:

1. `findOne(category, key, scope)` — a `findFirst` filtered by `siteId ?? null`, `tenantId ?? null`, `namespace`, `key`, `deletedAt: null`.
2. If a row is found, `UPDATE` it in place.
3. Only if no row is found does it `CREATE` a new one.

This find-then-write pattern is what actually prevents duplicate Global-scope rows in practice — but it is a guarantee provided by this codebase's write path, not by a database constraint. It holds as long as every write to the `Setting` table goes through `SettingsRepository`. It does **not** hold against: a raw SQL `INSERT`, a concurrent request racing between the `findFirst` and the `create` (no transaction/advisory lock wraps the two calls today), or a future code path that queries/writes `Setting` directly instead of through this repository.

### Future strategy

Closing this gap at the database level requires a schema/migration change, which is out of scope for both Milestone 6 and this stabilization patch (`36_DATABASE_FREEZE.md` remains frozen; this patch's own instructions permit only the `datasource` block change in Task 1). Options for a future milestone, not decided here:

- A generated/computed column that coalesces `site_id`/`tenant_id` to a sentinel non-null value (e.g. a fixed nil UUID) purely for uniqueness purposes, with a unique index over the generated column instead of the raw nullable ones.
- Wrapping `SettingsRepository`'s find-then-write in a serializable transaction or a Postgres advisory lock keyed by `(namespace, key)` to close the race-condition window, without changing the schema.
- Both are additive, backward-compatible schema/behavior changes and can be introduced without altering any existing column, model, or migration already frozen.

## Known Gaps (documented, not silently fixed)

- **Global-scope uniqueness** — see "Global Settings Resolution" above; enforced at the application layer only, not by PostgreSQL.
- **No live cache, history, or encryption.** `SettingsCacheInterface`, `SettingsHistoryInterface`, `SettingsEncryptionInterface` are pure TypeScript interfaces with zero implementations and zero DI providers registered — exactly mirroring the `EmailProvider`/`AuthorizationCacheProvider` pattern from `37_IDENTITY_FREEZE.md`/`38_RBAC_ARCHITECTURE.md`. Every read hits the database directly; every write is unaudited beyond the existing `createdBy`/`updatedBy` columns; encrypted-flagged settings are stored as plain JSON today (see Security, below).

## Security

- Every endpoint requires the existing global `JwtAuthGuard` (authentication) plus `PermissionGuard` + `@RequirePermission(PERMISSIONS.SETTINGS_MANAGE)` (authorization) — the single frozen `settings.manage` permission key from `38_RBAC_ARCHITECTURE.md`. No new permission key was added; a separate view-only permission was deliberately not invented (the RBAC doc's own rule: "never inventing an ad-hoc string at a call site").
- `PASSWORD`/`SECRET` types and `isEncrypted: true` definitions are redacted in all read paths (`null` in the response) — this is defense-in-depth given encryption itself is not implemented in this milestone.
- Encryption is interface-only by explicit instruction — `SettingsEncryptionInterface.encrypt()/decrypt()` have no implementation and are never called by `SettingsService`. Treat any `SECRET`/`PASSWORD` setting as plaintext-at-rest until a concrete provider is implemented and wired in a future milestone.

## Feature Flags — Architecture Change From Prior Freeze

`35_ARCHITECTURE_FREEZE.md`'s "Rejected Audit Suggestions" and `36_DATABASE_FREEZE.md`'s "Deferred Features" both previously rejected a `feature_flags` table for V1. This milestone's explicit instruction — "Move all feature flags to the settings architecture. Feature flags must be runtime configurable." — reverses that decision's _intent_ while preserving its _letter_: no new `feature_flags` table was created. Feature flags are now `Setting` rows under `SettingCategory.FEATURE_FLAGS`, using the same generic table every other setting uses.

`FeatureFlagsService.isEnabled()`/`getAll()` (`core/feature-flags/`) now resolve through `SettingsService.resolveValue()` instead of reading `AppConfigService.features` directly — both methods became `async` (no existing call site depended on their previous synchronous signature; a repo-wide check confirmed zero consumers before this change). The `FEATURE_*_ENABLED` env vars remain the fallback tier via each flag's `envKey`, so existing `.env`-only deployments are unaffected until an operator explicitly overrides a flag through `PUT /settings/category/feature_flags`.

`35_ARCHITECTURE_FREEZE.md` and `feature-flags.service.ts`'s code comment have been updated in this same change to record this reversal, per `40_PRODUCT_PHILOSOPHY.md` Principle 15 ("Documentation First").

## API Surface

All under `/settings`, all requiring `settings.manage`:

| Method | Path                           | Purpose                                                      |
| ------ | ------------------------------ | ------------------------------------------------------------ |
| GET    | `/settings`                    | Every setting, resolved                                      |
| GET    | `/settings/export`             | Export all resolved settings (sensitive values redacted)     |
| GET    | `/settings/category/:category` | Every setting in one category                                |
| GET    | `/settings/:key`               | One setting by dotted `category.key`                         |
| PUT    | `/settings/category/:category` | Bulk-update every listed key in a category                   |
| PUT    | `/settings/:key`               | Update one setting                                           |
| POST   | `/settings/import`             | Bulk import; unknown/read-only keys are skipped, not errored |
| POST   | `/settings/reset`              | Reset every setting to its system default                    |
| POST   | `/settings/reset/category`     | Reset one category to system defaults                        |

Every endpoint is documented via the frozen `ApiWrappedResponse(Model)` wrapper (`37_IDENTITY_FREEZE.md` §API Contract). `ApiWrappedResponse` gained an `isArray` option in this milestone (backward-compatible — defaults to `false`, no existing call site affected) since Settings' list endpoints are the first callers needing an array-wrapped `data`.

**`PUT`, not `PATCH` — confirmed intentional (stabilization patch, post-Final-Backend-Audit).** Settings is the only module in the codebase using `PUT` for updates; every other module (Articles, Categories, Media, Comments, Users, SEO) uses `PATCH`. The audit flagged this as a REST-convention inconsistency worth confirming rather than assuming. Resolved as: **keep `PUT`, documented here as intentional, not converted.** Reasoning — a `Setting`'s only mutable field is `value` (`36_DATABASE_FREEZE.md`: `id, siteId?, tenantId?, namespace, key, value: Json` + audit sextuple); `PUT /settings/:key { value }` and `PUT /settings/category/:category { settings: [...] }` each **fully replace** the one mutable field of the resource(s) they target, which is exactly `PUT`'s defined REST semantics (idempotent full-representation replacement) — unlike Articles/Categories/etc., where `PATCH` reflects a genuine partial update against a resource with many independently-mutable fields. Converting to `PATCH` was considered and rejected: the task's own bar for a verb change was "ONLY if 100% backward compatible," and swapping the route decorator from `@Put` to `@Patch` would break any existing client hard-coded to `PUT` (adding both decorators for the same handler was also considered and rejected as unnecessary complexity for a semantically-correct existing verb). No code changed.

## Examples

```
GET /settings/category/ai
→ { success: true, data: [
    { key: "ai.enabled", category: "ai", type: "BOOLEAN", value: false, source: "DEFAULT", ... },
    { key: "ai.provider", category: "ai", type: "STRING", value: "openai", source: "DEFAULT", ... },
    { key: "ai.apiKey", category: "ai", type: "SECRET", value: null, source: "DEFAULT", isEncrypted: true, ... }
  ], ... }

PUT /settings/ai.enabled  { "value": true }
→ enables AI at the database tier; still overridden by AI_ENABLED env var if set (env ranks above database)
```

## Future AI Integration

`SettingCategory.AI` already defines `enabled`, `provider`, `apiKey` (encrypted-flagged). A future AI module reads these through `SettingsService.getByCategory(SettingCategory.AI)` — never its own env lookup — so `Settings → AI → Enable → API Key → Provider → Ready` (per `41_PLATFORM_CAPABILITIES.md`) becomes a pure Settings read. Disabling `ai.enabled` must remain sufficient to fully disable AI regardless of what else is configured (`40_PRODUCT_PHILOSOPHY.md` Principle 1).

## Future Storage Integration

`SettingCategory.STORAGE` mirrors the existing `STORAGE_*` env vars via `envKey`, all currently `isReadOnly: true` (infrastructure credentials, not admin-editable through V1's UI-less foundation). A future Storage module/admin UI can lift `isReadOnly` once a concrete provider-switching UX exists — no repository or service change required, only a registry edit.

## Future Search Integration

`SettingCategory.SEARCH` mirrors `SEARCH_ENABLED`/`SEARCH_ENGINE`. A future Search module reads `SettingsService.getByCategory(SettingCategory.SEARCH)` the same way, keeping `40_PRODUCT_PHILOSOPHY.md` Principle 3 (Provider Pattern) intact — the search adapter never reads `process.env` directly.

## Future SaaS / Multi-Tenant Compatibility

`SettingScope.TENANT` and the repository's tenant-scoped `scopeWhere()` already exist; a future tenant-aware call site only needs to pass a non-null `tenantId` in `SettingScopeContext` — no `SettingsService` API change, matching the same extensibility pattern `38_RBAC_ARCHITECTURE.md` established for `Role.tenant_id`.

## Testing

Unit tests only (no controller e2e beyond direct-call specs, consistent with the rest of this codebase's test conventions): `SettingsValidator` (type/rule matrix), `SettingsRepository` (mocked `PrismaService`, scope/upsert/soft-delete behavior), `SettingsService` (mocked repository — full priority-chain resolution, redaction, read-only rejection, import/export/reset), `SettingsController` (mocked service — delegation only), plus a `FeatureFlagsService` spec covering the new Settings-backed resolution. All added tests pass alongside the pre-existing 132-test suite (now 21 suites total).

## Future Enhancement — Settings Permission Split (Deferred, Not Implemented)

Today, every Settings endpoint — read and write — requires the single frozen `settings.manage` permission (`38_RBAC_ARCHITECTURE.md`). A future **Enterprise Edition** (`40_PRODUCT_PHILOSOPHY.md` Product Editions, `41_PLATFORM_CAPABILITIES.md` Edition 3) may warrant separating:

- `settings.view` — read-only (`GET /settings`, `GET /settings/category/:category`, `GET /settings/:key`, `GET /settings/export`).
- `settings.manage` — write/mutate (`PUT`, `POST /settings/import`, `POST /settings/reset*`) — unchanged from the current implementation.

**This split is deferred. It is NOT implemented in this codebase. `settings.view` is NOT part of the frozen `PERMISSIONS` vocabulary** (`38_RBAC_ARCHITECTURE.md`). No `SettingsController` endpoint should be changed to expect `settings.view` until that permission is formally added to `PERMISSIONS` and this document and `38_RBAC_ARCHITECTURE.md` are updated together, per `RULE_ZERO` / `40_PRODUCT_PHILOSOPHY.md` Principle 15 (Documentation First).

## Deferred / Explicitly Out of Scope

Frontend, Admin UI, live cache/history/encryption implementations, site/tenant-scoped REST routing, a runtime-override REST endpoint (the tier exists in `SettingsService` but nothing calls `setRuntimeOverride()` from an endpoint yet), new business modules, new permission keys beyond the existing `settings.manage`.

## Approved Date

Pending — awaiting explicit approval before Milestone 7 begins, per this milestone's own instruction.

## Architecture Status

**IMPLEMENTED, AWAITING APPROVAL** — Platform Settings & System Configuration Foundation (Milestone 6).
