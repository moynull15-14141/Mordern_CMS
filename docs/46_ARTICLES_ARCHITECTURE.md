# 46_ARTICLES_ARCHITECTURE

## Executive Summary

Content / Articles Foundation (Milestone 8). Mirrors `39_SETTINGS_ARCHITECTURE.md`/`42_USER_MANAGEMENT_ARCHITECTURE.md`'s role for their modules: from this point forward, `apps/backend/src/modules/articles/` is the literal implementation of what this document describes. **Backend foundation only** — no Media upload, Comments, Notifications, Email, Webhooks, AI, Search Engine, Analytics, Widgets, Homepage Builder, Theme Engine, Plugin System, or Public Website.

Identity (Milestone 4), Authorization/RBAC (Milestone 5), Settings (Milestone 6), and Users (Milestone 7) already existed; this is the first _content_ business module, and the first to give the previously interface-only `ArticlePolicy` (`38_RBAC_ARCHITECTURE.md`) a real implementation.

**Architecture Status at time of writing: awaiting approval.**

## Folder Structure

```
articles/
├── controllers/   — ArticlesController (all endpoints below)
├── services/      — ArticlesService (the single orchestrator)
├── repositories/  — ArticlesRepository (Article CRUD + read access to Author/Category/Tag/MediaAsset/Site)
├── validators/    — ArticlesValidator (slug shape, status-transition rule, future-date rule)
├── mappers/       — ArticlesMapper (Article + relations -> ArticleResponseDto; revisions -> response/metadata DTOs)
├── policies/      — ArticleOwnershipPolicy (first concrete implementation of ArticlePolicy)
├── interfaces/    — ArticleQueryFilters/Options, ArticleSeoInput, ArticleRevisionMetadata
├── constants/      — ArticleSortField, generic-update-allowed statuses, slug length limits
├── exceptions/    — ArticleNotFoundException and 8 others
├── utils/         — slug.util.ts (normalize/generate/uniquify), word-count.util.ts
└── articles.module.ts
```

## Conflicts Found (reported before implementation, summarized here for the record)

1. **Article authorship is indirect.** `Article.authorId` → `Author.id`, not `User.id`; `Author.userId` is optional. Article creation requires an already-existing `authorId` (validated by existence check) — no Authors CRUD module exists yet, and provisioning one is out of this milestone's scope.
2. **`ArticlePolicySubject` needed extending.** Added `authorUserId: string | null` to the existing, frozen interface (`modules/authorization/policies/article.policy.ts`) — a minimal, additive change explicitly anticipated by that file's own "future subject shape once the Articles module exists" comment. One existing test (`policies.spec.ts`) was updated to match the new required field.
3. **`Article.slug` uniqueness is invisible from `schema.prisma` alone.** Enforced via a partial unique index (`(site_id, slug)` WHERE `deleted_at IS NULL`) added in a follow-up raw-SQL migration — same pattern already documented for Settings/Users. `docs/31_DATABASE_TABLES.md` states the constraint without the soft-delete carve-out.
4. **No `article.view`/`article.restore`/`tag.*`/`category.update`/`category.delete` permission exists.** None invented. Reads use `RequireAnyPermission` across the 4 existing article permissions; restore reuses `article.delete`.
5. **`SeoMeta` isn't a true 1:1 with `Article`** at the schema level. Enforced as 1:1 at the application layer (each article's SEO fields upsert its own row, never shared).
6. **`ArticleRevision` is append-only** (no `updatedAt`/`deletedAt`). "Restore revision" always creates a _new_ revision, never mutates history.
7. **No `canPublish` on the frozen `Policy<TSubject>` interface**, and `article.publish` is a separate permission from `article.update`. Resolved with dedicated `/publish`/`/schedule` endpoints; the generic update rejects direct transitions to PUBLISHED/SCHEDULED.
8. **No "current site" resolution utility existed anywhere** — resolved via `ArticlesRepository.getDefaultSite()` (`prisma.site.findFirst()`), a documented V1 single-site simplifying assumption.

## Workflow

```
POST /articles
  → validate references (author/category/tags/featuredMedia exist)
  → resolve site (single-site V1)
  → resolve slug (auto-generate + uniquify, or validate+check manual override)
  → upsert SeoMeta if `seo` provided
  → create Article
  → set tags (ArticleTag rows)
  → snapshot revision #1 ("Initial version")
  → audit log

GET /articles/:id | /articles/slug/:slug | /articles (paginated, filtered, sorted, searched)
  → read-only, RequireAnyPermission(article.create|update|delete|publish)

PATCH /articles/:id
  → load existing → ArticleOwnershipPolicy.canUpdate() → reject non-PUBLISHED/SCHEDULED status changes
  → snapshot revision of the PRE-update state → validate any changed references → resolve slug if changed
  → upsert SeoMeta if `seo` provided → update → replace tags if `tagIds` provided → audit log

DELETE /articles/:id → reject if already deleted → ArticleOwnershipPolicy.canDelete() → soft-delete → audit log
POST /articles/:id/restore → reject if not deleted → same ownership policy → restore → audit log
```

## Status Flow

Frozen `ContentStatus` enum only: `DRAFT, REVIEW, SCHEDULED, PUBLISHED, ARCHIVED, DELETED` (no new values invented). `DELETED` is never actually written to `status` — soft delete uses `deletedAt`/`deletedBy` instead, exactly like every other frozen table.

```
DRAFT / REVIEW / ARCHIVED  ──(generic PATCH /articles/:id, article.update, ownership-gated)──►  DRAFT / REVIEW / ARCHIVED
        │
        │  POST /articles/:id/publish  (article.publish, editorial-tier — no ownership check)
        ▼
   PUBLISHED  (publishedAt preserved on republish, never overwritten once set)

        │  POST /articles/:id/schedule  (article.publish; scheduledAt must be a future date)
        ▼
   SCHEDULED
```

The generic update's `ArticlesValidator.assertGenericUpdateStatus()` rejects any attempt to set `status` directly to `PUBLISHED` or `SCHEDULED` — those two transitions must go through the dedicated, `article.publish`-gated endpoints.

## Revision Flow

- **Create automatically before every update** — `ArticlesService.snapshotRevision()` captures the article's state _as it was before_ the change (title/summary/body/status/authorId), assigning `version = max(existing versions) + 1` (`@@unique([articleId, version])` respected).
- **Restore** — `POST /articles/:id/revisions/:version/restore` first snapshots the _current_ (pre-restore) state as yet another new revision (never mutates or deletes history, matching `ArticleRevision`'s append-only schema design), then applies the target revision's title/summary/body/status as a normal update.
- **Compare** — `GET /articles/:id/revisions/compare?from=X&to=Y` returns metadata only (`version`, `title`, `summary`, `status`, `authorId`, a computed `wordCount`, `createdAt`, `comment`) for both sides — **no visual diff**, per instruction. `ArticleRevision` has no stored `wordCount` column (unlike `Article`), so it's computed on the fly from the revision's JSON body for this comparison only.
- **List** — `GET /articles/:id/revisions` returns every revision, newest first, full body included (unlike the compare endpoint's metadata-only view).

## Slug Strategy

- **Auto-generate**: `generateSlugFromTitle()` normalizes the title (lowercase, strip diacritics, replace non-alphanumeric runs with single hyphens, trim). If the resulting slug is taken, `uniquifySlug()` appends `-2`, `-3`, ... until free (up to `SLUG_MAX_UNIQUENESS_ATTEMPTS`).
- **Manual override**: still normalized through the same function (never trusted verbatim), then shape-validated (`3`–`200` chars, `^[a-z0-9]+(-[a-z0-9]+)*$`). If the normalized manual slug collides with an existing active article, the write is **rejected** (`SlugConflictException`) — explicit user intent is never silently renamed, unlike the auto-generate path.
- **Uniqueness check**: application-layer only (`ArticlesRepository.findBySlug`, scoped by `siteId`, excluding soft-deleted rows and — on update — the article's own id), since the DB-level partial unique index isn't visible from `schema.prisma` and carries the same residual race-condition caveat already documented for Settings/Users.

## Permission Flow

| Action                                                              | Permission                                                                              | Ownership Policy?                              |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------- |
| List / Get by id / Get by slug / List revisions / Compare revisions | `RequireAnyPermission(article.create, article.update, article.delete, article.publish)` | No                                             |
| Create                                                              | `article.create`                                                                        | No (nothing to own yet)                        |
| Update / Restore revision                                           | `article.update`                                                                        | Yes — `ArticleOwnershipPolicy.canUpdate`       |
| Delete / Restore                                                    | `article.delete` (restore reuses delete — no `article.restore` exists)                  | Yes — `ArticleOwnershipPolicy.canDelete`       |
| Publish / Schedule                                                  | `article.publish`                                                                       | No — editorial-tier action, not ownership-tier |

`ArticleOwnershipPolicy` (first real implementation of `ArticlePolicy`) rules:

- **Super Admin, Administrator, Editor** — may update/delete _any_ article, regardless of ownership.
- **Author, Contributor** — may update/delete only articles where the article's `Author.userId` matches their own `User.id`.
- Everyone else — denied.

Because the frozen `Policy<TSubject>` contract is `(actorRoles, subject) => boolean` with no room for the acting user's own identity, `ArticleOwnershipPolicy` is constructed **per request** with the actor's id closed over (`new ArticleOwnershipPolicy(actor.id)`), rather than requiring a signature change to the shared `policy.interface.ts` used by Media/Comment/Settings policies too.

## Validation Rules

- **Title, subtitle, summary, notes** — length-bounded strings (class-validator `@MaxLength`).
- **Slug** — see "Slug Strategy" above.
- **Status** — must be a real `ContentStatus` value; PUBLISHED/SCHEDULED blocked on the generic update (see "Status Flow").
- **Dates** — `scheduledAt` must be a future ISO date-time (`ArticlesValidator.assertFutureDate`).
- **Visibility** — must be a real `ArticleVisibility` value (`PUBLIC | PRIVATE | UNLISTED`).
- **Category** — if provided, must reference an existing, non-deleted `Category` row.
- **Tags** — if provided, every id must reference an existing, non-deleted `Tag` row (all-or-nothing — one missing id fails the whole request).
- **Author** — must reference an existing, non-deleted `Author` row (see Conflict #1).
- **SEO relation** — nested `seo` object validated field-by-field (URL, string lengths, JSON-object shape for `openGraph`/`twitterCard`/`schemaJson`/`robots`/`extraMeta`), upserted into the article's own `SeoMeta` row.
- **Featured media** — if provided, must reference an existing, non-deleted `MediaAsset` row (metadata reference only — no upload, mirroring the Users' avatar precedent from Milestone 7).

## Future Integrations

### Media

`Article.featuredMediaId` and the `ArticleMedia` join table already exist in the frozen schema; this module validates a _given_ `MediaAsset` id exists but implements no upload, no gallery management, no `ArticleMedia` CRUD. A future Media module supplies the actual `MediaAsset` rows.

### Comments

`Article.comments Comment[]` relation exists in the schema; nothing in this module reads or writes it. A future Comments module owns that relation entirely, gated by the existing (unused-so-far) `comment.moderate` permission.

### SEO

This module upserts basic per-article `SeoMeta` fields as part of editing the article itself (gated by `article.update`, not `seo.manage`). A future dedicated SEO module (redirects, sitemaps, global SEO settings, gated by `seo.manage`) is a separate concern layered on top of the same `SeoMeta` table — no schema change needed for it to coexist.

### Search

Filtering/search in this module is **database search only** (`ILIKE` via Prisma's `contains`/`insensitive` mode, per instruction) — no Elasticsearch/Meilisearch/AI. `SettingCategory.SEARCH` (Milestone 6) already anticipates a future dedicated search engine; Articles' own list/search endpoint would need no change to benefit once one exists, since the repository's query-building is isolated behind `findMany()`.

### AI

None. Consistent with `40_PRODUCT_PHILOSOPHY.md` Principle 1 — Articles are fully manually operable with zero AI dependency. `AiTaskType.WRITER`/`REWRITE`/`SUMMARY` (frozen enum, `36_DATABASE_FREEZE.md`) remain unimplemented and unreferenced by this module.

## Testing

Unit tests only, matching this codebase's convention: `slug.util` (14 tests), `word-count.util` (5), `ArticlesValidator` (11), `ArticleOwnershipPolicy` (10), `ArticlesMapper` (5), `ArticlesRepository` (13, mocked `PrismaService`), `ArticlesService` (17, mocked repository/authorization/audit), `ArticlesController` (8, mocked service), plus 2 DTO specs (`CreateArticleDto`, `ScheduleArticleDto`). Total: **277 tests / 38 suites** passing workspace-wide (up from 191/28 before this milestone).

## Deferred / Explicitly Out of Scope

Media upload, Comments, Notifications, Email, Webhooks, AI, a dedicated Search Engine, Analytics, Widgets, Homepage Builder, Theme Engine, Plugin System, Public Website/frontend rendering, Category/Tag CRUD (referenced by existence check only), Author CRUD (referenced by existence check only), an `article.view`/`article.restore` permission split, real-time collaborative editing, reading-time/word-count auto-computation on the `Article` row itself (both columns exist but are left null — not a requested feature).

## Approved Date

Pending — awaiting explicit approval before Milestone 9, per this milestone's own instruction.

## Architecture Status

**IMPLEMENTED, AWAITING APPROVAL** — Content / Articles Foundation (Milestone 8).
