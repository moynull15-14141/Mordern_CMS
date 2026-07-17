# 54_RELEASE_NOTES_V1

## Version

V1.0.0 (backend foundation freeze)

## Release Date

2026-07-17 (date of this freeze patch's completion)

## Milestones Completed

2 / 2.1 (Backend Scaffolding & Core Infrastructure) · 3 / 3.1 (Database Foundation) · 4 / 4.1 (Identity & Authentication) · 5 (RBAC/Authorization) · 6 (Settings & System Configuration) · 7 (User Management) · 8 (Articles) · 9 (Categories & Tags) · 10 (Media Library) · 11 (Comments & Discussion) · 12 (SEO & Metadata Engine) · Final Backend Architecture Audit · three stabilization patches (documentation refresh, SEO security hardening, Medium-issue remediation).

## Features Delivered

- **Identity & Authentication** — JWT bearer auth, refresh-token rotation (no blacklist), bcrypt password hashing, password reset / email verification flows (token generation; delivery is log-only — no email provider wired in).
- **Authorization (RBAC)** — role/permission resolution engine, 21 frozen permission keys, 11 frozen system roles, one linear role-hierarchy chain, ownership-policy pattern (`ArticleOwnershipPolicy`, `MediaOwnershipPolicy`, `CommentOwnershipPolicy`, `TaxonomyPolicy`).
- **Settings** — 17-category, 12-type closed-vocabulary configuration registry with a 4-tier resolution priority (runtime override → env var → database → system default); export/import/bulk-update/reset endpoints; secret redaction by default.
- **User Management** — full CRUD, profile/preferences via JSON metadata, session list/terminate, self-service vs. admin-gated password flows, avatar via existing `MediaAsset` reference, soft delete/restore, search/filter/sort/paginate.
- **Articles** — full CRUD, append-only revision history (auto-snapshotted before every update), slug auto-generation/uniqueness, publish/schedule workflow (dedicated endpoints, generic update blocks direct status jumps), ownership-gated edit/delete, inline SEO upsert.
- **Categories & Tags** — unlimited-depth tree (in-memory, no recursive SQL), move-with-cycle-detection, delete guards (in-use-by-article / active-children), breadcrumb/ancestors/descendants, role-tier (non-ownership) access policy.
- **Media** — asset + folder library (metadata registration only, no file-byte handling), 4-source usage detection, heuristic duplicate detection, Settings-driven upload limits/MIME allow-list, ownership-gated mutation.
- **Comments** — unlimited-depth threaded replies, self-service create/edit/delete-own, moderator-tier approve/reject/spam, non-moderators restricted to APPROVED-only visibility, plain-text sanitization (all HTML stripped).
- **SEO** — standalone `SeoMeta` CRUD + by-id upsert, canonical URL normalization (duplicate-slash collapse, trailing-slash strategy, `http`/`https`-only scheme enforcement), OpenGraph/Twitter Card/robots-directive/JSON-LD validation (store+validate only, never generate or render), Settings-backed preview fallback, deterministic (non-AI) validation warnings.

## Known Limitations

- No file upload engine — Media registers metadata only; `StorageProvider`/`CacheProvider`/`EmailProvider` are interfaces with zero implementation.
- `AuditLoggerService`/`SecurityLoggerService` are structured log lines only, not persisted to the `AuditLog` table.
- Application-layer-only uniqueness (no DB constraint, documented race-condition caveat) on: Settings' Global scope, `User.email`/`username`, `Category.name`/`Tag.name`.
- Three independent write paths into `SeoMeta` (Articles, Categories, standalone SEO module) with no cross-module consistency check.
- No durable audit trail, no caching layer (`AuthorizationCacheProvider` is interface-only), no live-database migration verification in this build environment.
- No frontend, no public website, no admin UI — this release is backend-only.

## Deferred Features

Roles/Permissions management CRUD, Authors, Pages, Search engine integration, Ads, Analytics, Notifications, Scheduler, durable Audit persistence, AI (writer/rewrite/summary/meta/FAQ/internal-links/tags/categories — schema-ready, unimplemented), Sitemap generation (XML/News/Image/Video/Index/Auto-Submit), Webhooks, Blocks/Widgets/Page Builder, Theme Engine, Mega Menu, Dynamic Homepage, Membership/Subscriptions/Paywall, Marketplace, Podcast/Video CMS, Vector Search/Recommendation Engine, Multi-region deployment, full Multi-tenant isolation (schema-ready, no tenant-scoped query logic), Custom Roles UI, Plugin System (rejected as a permanent direction, not merely deferred).

## Migration Notes

No data migration is required for this release — schema V1.2 has been stable and unchanged since Milestone 3.1; every business module from Articles (Milestone 8) onward built exclusively on the already-frozen schema. Deploying this release to an environment that already ran Milestones 1–7 requires no additional migration step beyond the 3 migrations already documented in `36_DATABASE_FREEZE.md`. **A live-database migration run has not been verified in this build environment** — verify `prisma migrate deploy` against a real target before production use.

## Compatibility Notes

- PostgreSQL 13+ (developed/validated against 15/16 via Supabase); no Supabase-specific SQL or SDK anywhere in the schema or migrations — any standard PostgreSQL provider works with only a `DATABASE_URL` change.
- Node.js v24, NestJS (Fastify adapter), Prisma 6.19.3, TypeScript 5.9.3, `pnpm@8.15.9`.
- API surface is versioned at `/api/v1/` — see `53_API_FREEZE.md` for the frozen contract and breaking-change policy going forward.
- No environment variable was added, removed, or renamed by any milestone or stabilization patch beyond what `env.validation.ts` already required as of Milestone 2.1; a new `config/env/test.env.example` template was added (safe to commit — no real secrets) to close a CI-environment gap the Final Backend Architecture Audit flagged.

## Approved Date

Pending — part of the same freeze patch as `52_BACKEND_FREEZE_REPORT.md`, `53_API_FREEZE.md`, `55_FRONTEND_HANDOFF.md`.

## Architecture Status

**RELEASE NOTES — AWAITING APPROVAL.**
