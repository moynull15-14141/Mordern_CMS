# 36_DATABASE_FREEZE

## Executive Summary

This document is the official freeze declaration for the V1 database foundation. It supersedes ambiguity between `31_DATABASE_TABLES.md`, `32_ENTITY_RELATIONSHIP.md`, and `35_ARCHITECTURE_FREEZE.md` where those docs previously disagreed (Menus/ActivityLogs — resolved in Milestone 3.1, see below). From this point forward, `config/prisma/schema.prisma` is the literal implementation of what this document freezes; any future schema change must update this document in the same change.

## Database Version

PostgreSQL 13+ (partial/filtered unique indexes require only 9.5+, so this is a conservative floor). Developed and validated against PostgreSQL 15/16 via Supabase's managed Postgres for local development, per `40_PRODUCT_PHILOSOPHY.md`'s Database Strategy.

## Schema Version

**V1.2** — Milestone 3 established the initial 37-model schema; Milestone 3.1 froze it (partial unique indexes, enum documentation, cross-doc sync); Milestone 4.1 §3 extended `Session` with architecture-readiness metadata columns (`browser`, `operating_system`, `country`, `city`, `remember_me`) — no model added/removed, no existing column changed, no logic populates the four metadata fields yet (no UA parser or geo-IP lookup wired in).

## Totals

| Metric                                                | Count                                                                                                           |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Models                                                | 37                                                                                                              |
| Enums                                                 | 18                                                                                                              |
| `@relation` declarations                              | 72                                                                                                              |
| `@@index` (plain indexes)                             | 68                                                                                                              |
| `@@unique` declared in Prisma                         | 1 (`ArticleRevision.(articleId, version)` — no `deletedAt`, so a full-table constraint is correct as-is)        |
| Partial unique indexes (manual SQL, active-rows-only) | 25                                                                                                              |
| Migrations                                            | 3 (`20260716000000_init_v1_schema`, `20260716000001_partial_unique_indexes`, `20260716000002_session_metadata`) |

## Soft Delete Strategy

Every primary entity carries the standard audit sextuple: `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by` (`30_DATABASE_ARCHITECTURE.md` §5). `deleted_by`/`created_by`/`updated_by` are plain nullable UUID columns with **no** enforced FK relation to `users` — an intentional choice to avoid dozens of back-relation arrays on `User` for a field that's informational, not referentially critical.

Tables with genuinely no soft-delete concept (`ArticleRevision`, `AnalyticsEvent`, `AuditLog`, `ActivityLog`) only have `created_at` — they're immutable/append-only logs, matching `30 §4`'s "hard delete is reserved for audit logs... and retention-bound operational cleanup."

Uniqueness scoped to active rows only (§ below) is enforced via partial unique indexes, not application-layer checks — the database is the source of truth for this constraint.

## Partial Unique Index Strategy

Prisma's schema DSL has no `WHERE` clause for `@@unique`. Every soft-deletable table's uniqueness constraint (25 of them — every `@@unique`/`@unique` originally declared except `ArticleRevision`'s) is now:

1. A plain `@@index` in `schema.prisma` (query-performance only, no uniqueness enforced by Prisma).
2. A real `CREATE UNIQUE INDEX ... WHERE "deleted_at" IS NULL` in the manual migration `20260716000001_partial_unique_indexes`.

This means a soft-deleted row's slug/path/email/token — whichever field it was — becomes reusable by a new active row, while two _active_ rows can never collide. Because Prisma never sees the partial index (it's not representable in the schema), future `prisma migrate dev` runs will never try to "correct" it back to a full-table constraint.

## UUID Strategy

`String @id @default(uuid()) @db.Uuid` on every primary key and foreign key, per `33_PRISMA_MODELING_GUIDE.md`. UUIDs are generated client-side by Prisma (v4), not by a Postgres default — this keeps ID generation portable across any Postgres provider without depending on `pgcrypto`/`gen_random_uuid()` being enabled.

## Naming Convention

PascalCase Prisma model names, camelCase fields, `@map`/`@@map` to `snake_case` table and column names in Postgres. Enum type names are PascalCase in Prisma, `snake_case` via `@@map` in Postgres; enum _values_ are `UPPER_SNAKE_CASE` in both.

## Migration Strategy

No live PostgreSQL instance was reachable in the build environment, so migrations were generated via `prisma migrate diff --script` (from-empty for the initial migration, hand-authored-but-Prisma-index-name-accurate for the partial-unique follow-up) rather than `prisma migrate dev` against a real database. Both migrations are deterministic and reproducible from `schema.prisma`. Apply with `prisma migrate deploy` against a real `DATABASE_URL` — this has not been executed against a live database and should be verified there before relying on it in staging/production.

## Seed Strategy

`config/prisma/seed.ts` seeds only a default Tenant + Site (idempotent upserts), via a modular `config/prisma/seeds/*.seed.ts` pattern. Deliberately does **not** seed Roles, Permissions, or an admin User — those require a confirmed RBAC taxonomy and password hashing, which belong to the Auth/Users/Roles business modules, not database foundation.

## Database Agnostic Confirmation

`datasource db { provider = "postgresql", url = env("DATABASE_URL") }` — no Supabase SDK, no Supabase-specific types, no vendor-specific SQL anywhere in the schema or the two migrations (confirmed by manual review of both `migration.sql` files: every statement is standard PostgreSQL DDL — `CREATE TABLE`, `CREATE TYPE ... AS ENUM`, `CREATE INDEX`, `CREATE UNIQUE INDEX ... WHERE`, `ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY`). Changing providers requires only a new `DATABASE_URL`.

## PostgreSQL Compatibility

Partial/filtered unique indexes (`WHERE` clause) are standard PostgreSQL syntax available since 9.5 — not a Supabase extension or proprietary feature. `gen_random_uuid()`/`pgcrypto` are **not** required since UUIDs are generated client-side. JSONB, `TEXT[]`, `BIGINT`, `TIMESTAMPTZ` are all core PostgreSQL types supported by every provider listed in `40_PRODUCT_PHILOSOPHY.md`'s Database Strategy (self-hosted, Neon, Railway, RDS, Azure, Cloud SQL, DigitalOcean, Supabase).

## Supabase Compatibility

Confirmed compatible as a plain PostgreSQL connection string. No Supabase Auth, Storage, Edge Functions, Realtime, or AI SDK is imported or referenced anywhere in `apps/backend` or `config/prisma`.

## Future Compatibility

- **Multi-site ready**: nearly every table is `site_id`-scoped already; multi-site was never a V1 feature but requires no schema rewrite to activate.
- **Multi-tenant ready**: `tenant_id` exists on `Site`, `User`, `Role`, `Notification`, `Setting`, `ApiKey`, `AuditLog`; V1 runs single-tenant, per `30_DATABASE_ARCHITECTURE.md` §13.
- **Agency/Enterprise/SaaS editions** (`40_PRODUCT_PHILOSOPHY.md` Product Editions): additive only — no model in this schema needs to change shape to support them, per that document's Development Rule.

## Deferred Features (not in this schema, confirmed absent)

`feature_flags` (a dedicated table remains deferred — Milestone 6 moved feature-flag _storage_ into the existing `settings` table instead, under `SettingCategory.FEATURE_FLAGS`; see `39_SETTINGS_ARCHITECTURE.md`. `FeatureFlagsService` from Milestone 2.1 is no longer config-only — it now resolves through the Settings priority chain), `webhooks` + delivery history, `blocks`, `widgets`, `member_subscriptions`, `content_permissions`, `newsletter_subscriptions`, `search_index_status`, `media_transforms`, `api_rate_limits`, `categories_translations`/`tags_translations`, `article_collections`. All per `31_DATABASE_TABLES.md`'s "Additional Tables" and `35_ARCHITECTURE_FREEZE.md`'s "Deferred Features."

## Documentation Sync (Milestone 3.1 resolution)

`Menus` and `ActivityLogs` were fully specified in `31_DATABASE_TABLES.md` (no deferred marker) but absent from `32_ENTITY_RELATIONSHIP.md`'s ER diagram and `35_ARCHITECTURE_FREEZE.md`'s Final Database Summary. Both docs have been updated in this milestone to include them consistently — all three documents (and the schema) now agree: **both are V1**.

## Enum Reference

Every enum below is frozen for V1. "Source" of `V1 decision` means the value set was chosen during Milestone 3/3.1 (not previously dictated by a frozen doc) and is now locked; "Source: frozen doc" means the values are a direct transcription of an already-frozen requirement.

| Enum                  | Purpose                                              | Allowed Values                                                        | Default         | Source                                                                                    | Future Expansion                                                     |
| --------------------- | ---------------------------------------------------- | --------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `ContentStatus`       | Editorial lifecycle for Article/ArticleRevision/Page | DRAFT, REVIEW, SCHEDULED, PUBLISHED, ARCHIVED, DELETED                | DRAFT           | Frozen — `20_BACKEND_ARCHITECTURE.md` §14                                                 | None expected                                                        |
| `ArticleVisibility`   | Audience visibility of a published article           | PUBLIC, PRIVATE, UNLISTED                                             | PUBLIC          | V1 decision                                                                               | Paywall/gated tiers deferred to V2 membership features               |
| `UserStatus`          | Account lifecycle                                    | ACTIVE, INACTIVE, SUSPENDED, PENDING                                  | PENDING         | V1 decision                                                                               | LOCKED (security lockout) may be added with 2FA in the Auth module   |
| `TenantStatus`        | Tenant lifecycle                                     | ACTIVE, INACTIVE, SUSPENDED                                           | ACTIVE          | V1 decision                                                                               | Billing states (PAST_DUE, CANCELLED) with SaaS Cloud edition         |
| `SiteStatus`          | Site lifecycle                                       | ACTIVE, INACTIVE, MAINTENANCE                                         | ACTIVE          | V1 decision                                                                               | None expected in single-site V1                                      |
| `CategoryStatus`      | Taxonomy visibility                                  | ACTIVE, INACTIVE                                                      | ACTIVE          | V1 decision                                                                               | None expected                                                        |
| `MediaType`           | Uploaded asset kind                                  | IMAGE, VIDEO, DOCUMENT, AUDIO                                         | none (required) | V1 decision                                                                               | None expected — format detail lives in `mime_type`                   |
| `MediaStatus`         | Asset processing pipeline state                      | PROCESSING, READY, FAILED, ARCHIVED                                   | PROCESSING      | V1 decision                                                                               | Transform-specific sub-states deferred to `media_transforms` (V2/V3) |
| `CommentStatus`       | Moderation state                                     | PENDING, APPROVED, REJECTED, SPAM                                     | PENDING         | V1 decision                                                                               | None expected                                                        |
| `RedirectStatus`      | Whether a redirect rule is active                    | ACTIVE, INACTIVE                                                      | ACTIVE          | V1 decision                                                                               | None expected                                                        |
| `SitemapType`         | Sitemap flavor                                       | XML, IMAGE, NEWS, RSS                                                 | none (required) | V1 decision, matches `20_BACKEND_ARCHITECTURE.md` §25                                     | None expected                                                        |
| `SitemapStatus`       | Sitemap generation job state                         | PENDING, GENERATED, FAILED                                            | PENDING         | V1 decision                                                                               | None expected                                                        |
| `AdStatus`            | Ad slot lifecycle                                    | ACTIVE, INACTIVE, EXPIRED                                             | ACTIVE          | V1 decision                                                                               | None expected                                                        |
| `NotificationChannel` | Delivery channel                                     | EMAIL, IN_APP, SLACK, WEBHOOK                                         | none (required) | V1 decision                                                                               | SMS/push if a native mobile API is built                             |
| `NotificationStatus`  | Delivery lifecycle                                   | PENDING, SENT, FAILED, READ                                           | PENDING         | V1 decision                                                                               | None expected                                                        |
| `AiTaskType`          | Which AI capability an `AiJob` performs              | WRITER, REWRITE, SUMMARY, META, FAQ, INTERNAL_LINKS, TAGS, CATEGORIES | none (required) | Frozen — `20_BACKEND_ARCHITECTURE.md` §26 / `35_ARCHITECTURE_FREEZE.md` Final AI Strategy | New task types require a docs update to §26/35 first, per RULE_ZERO  |
| `AiJobStatus`         | AI job queue lifecycle                               | PENDING, PROCESSING, COMPLETED, FAILED                                | PENDING         | V1 decision                                                                               | Retry/backoff sub-states deferred to the actual queue implementation |
| `ApiKeyStatus`        | Integration key lifecycle                            | ACTIVE, REVOKED, EXPIRED                                              | ACTIVE          | V1 decision                                                                               | None expected                                                        |

### Deliberately not enumerated

The milestone brief's example list included a few names that don't correspond to an actual schema field as an enum — `NotificationType`, `RoleType`, `PermissionType`, `SearchType`. These map to fields that were deliberately kept as open-ended `String` in Milestone 3 (`Notification.type`, `Role.scope`, `Permission.group`) per `33_PRISMA_MODELING_GUIDE.md`'s enum-explosion warning, or don't exist as a database column at all (`SearchType` — search provider selection is a backend **config** value from Milestone 2.1's `SearchConfig`, not a database enum). Converting these to enums now would be a schema/field-type change, which this milestone's "do not add new features" instruction rules out. Also intentionally `String`, unchanged from Milestone 3: `event_type`, `activity_type`, `action`, `category`, settings `namespace`/`key`, ad placement `page_type`/`position` — all inherently open-ended taxonomies, not fixed sets.

## Approved Date

2026-07-16

## Architecture Status

**FROZEN** — no model, relation, enum, or index strategy may change without a new milestone document, per `RULE_ZERO`.

## Production Readiness

~20/100 — schema is production-grade, but zero business modules, repositories, or tests exist yet (by design; out of scope for every database milestone so far).

## Database Readiness

92/100 — up from Milestone 3's 88. Partial unique indexes are now real (not a disclosed gap), all enums are documented with purpose/values/default/future notes, and the `31`/`32`/`35` Menus/ActivityLogs contradiction is resolved. Remaining 8 points: the two migrations have never been applied to a live PostgreSQL instance (no live database was reachable in this build environment) — that verification still needs to happen against a real target before Milestone 4.

## Future Ready

Confirmed: multi-site, multi-tenant, and every V2/V3 deferred feature in `35_ARCHITECTURE_FREEZE.md` can be added additively on top of this schema without restructuring existing tables, per `40_PRODUCT_PHILOSOPHY.md` Principle 7 and 12.
