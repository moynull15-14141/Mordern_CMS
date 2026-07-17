# 47_CATEGORY_TAG_ARCHITECTURE

## Executive Summary

Category & Tag Foundation (Milestone 9). Mirrors `46_ARTICLES_ARCHITECTURE.md`'s role for its module: from this point forward, `apps/backend/src/modules/categories/` is the literal implementation of what this document describes. **Backend foundation only** — no Frontend, Admin UI, Public Website UI, Drag & Drop UI, Media Library, Comments, Widgets, Menu Builder, Page Builder, Theme Builder, Workflow Engine, Publishing Queue, Notification Engine, Search Engine, Cache Layer, Analytics, Multi-site/SaaS/Enterprise logic.

**Architecture Status at time of writing: awaiting approval.**

**Stabilization patch (post-Final-Backend-Audit, Milestone 12+):** documents a `Category.name`/`Tag.name` application-layer-uniqueness gap the audit found undisclosed here (see the new Conflict entry below and "Validation"). No code, schema, or migration changed by this patch — `36_DATABASE_FREEZE.md`'s stabilization-patch-instruction Rule Zero ("NO migration unless required") was evaluated and a migration was judged not warranted now; see the Decision recorded in `docs/43_CONFLICT_RESOLUTION.md`'s Milestone 9 entry.

## Folder Structure

```
categories/
├── controllers/   — CategoriesController, TagsController (one module, two controllers/resources)
├── services/      — CategoriesService, TagsService
├── repositories/  — CategoriesRepository (Category CRUD + SeoMeta upsert), TagsRepository (Tag CRUD)
├── validators/    — SlugShapeValidator (shared by both — same slug rule)
├── mappers/       — CategoriesMapper (+ tree nodes), TagsMapper
├── policies/      — TaxonomyPolicy (first real Policy<TSubject> for taxonomy — role-tier only, no ownership)
├── dto/           — 11 files across both resources
├── interfaces/    — CategoryQueryFilters/Options, TagQueryFilters/Options, CategoryTreeNode, CategoryBreadcrumbItem
├── constants/     — CategorySortField, TagSortField, slug length limits
├── exceptions/    — 16 exception classes across both resources
├── utils/         — category-tree.util.ts (buildTree/getChildren/getDescendants/getAncestors/getBreadcrumb/wouldCreateCycle)
└── categories.module.ts
```

## Conflicts Found (reported before implementation, summarized here for the record)

1. **`Tag` has no `color` field and no generic metadata column.** "Tag Color" is **not implemented** — no schema column exists for it and none was added.
2. **`Category` has no `visibility` field and no generic metadata column at all.** "Category Visibility" and generic "Metadata" are **not implemented** for the same reason.
3. **No stored article/usage counters exist.** `articleCount`/`childrenCount`/`usageCount` are **computed live** via `COUNT` queries in the service layer, never cached/stored.
4. **No `category.update`/`category.delete`/any `tag.*` permission exists.** Every endpoint (both resources, read and write) reuses the single existing `category.create` permission — the same "one coarse permission for the whole resource" pattern Settings established in Milestone 6. `category.view`, `tag.view`, `category.restore` were explicitly not invented, per instruction.
5. **Slug uniqueness is invisible from `schema.prisma` alone** for both tables — confirmed via migration SQL: unique per `(siteId, slug)`, active rows only, same pattern as every other soft-deletable table. `docs/31_DATABASE_TABLES.md` states it without the soft-delete carve-out.
6. **Minor doc imprecision:** `docs/31_DATABASE_TABLES.md` describes `Category.status` as `TEXT`; it's actually the frozen `CategoryStatus` enum (`ACTIVE | INACTIVE` only).
7. **No ownership concept exists for Category/Tag** (no author-equivalent field, unlike Article). `TaxonomyPolicy` is therefore role-tier only (Super Admin/Administrator/Editor may manage taxonomy) — a real, non-trivial implementation, not a stub, but structurally different from `ArticleOwnershipPolicy`'s ownership branch.
8. **Additional safety check beyond the literal spec:** deleting a category is also rejected if it has active (non-deleted) child categories, not just when referenced by an Article — preventing orphaned hierarchy.
9. **`Category.name`/`Tag.name` uniqueness has no DB-level constraint (found undisclosed by the Final Backend Architecture Audit, post-Milestone-12).** Row 90 of "Validation" below already stated the check is application-layer-only, but this document never named the resulting race condition explicitly, unlike the equivalent, fully-disclosed gaps for Settings' Global scope (`39_SETTINGS_ARCHITECTURE.md`) and `User.email`/`username` (`42_USER_MANAGEMENT_ARCHITECTURE.md`). Stated explicitly now: two concurrent create/update requests with the same `name` can both pass `assertNameAvailable()`'s check-then-write and both succeed, producing duplicate active names for the same site — `slug` does NOT have this problem (it has a real partial unique index, per row 89). **Decision (this stabilization patch, per its own Rule Zero "no migration unless required"):** keep application-layer-only uniqueness, documented consistently here, rather than add a migration now. A future migration adding `CREATE UNIQUE INDEX ... WHERE deleted_at IS NULL` on `(site_id, name)` for both tables — mirroring the 25 existing partial unique indexes from `36_DATABASE_FREEZE.md` — would close this if ever prioritized. See `docs/43_CONFLICT_RESOLUTION.md`'s Milestone 9 entry for the full record.

## Category Strategy

CRUD is standard soft-delete/restore, identical in shape to Articles/Users:

```
POST /categories → validate parent (if any) exists → name uniqueness → slug resolve → SEO upsert (if given) → create
PATCH /categories/:id → name/slug/SEO updates (parent changes NOT allowed here — see "Move Category" below)
DELETE /categories/:id → reject if used by any Article OR has active children → soft delete
POST /categories/:id/restore → reject if not deleted → restore
```

## Tag Strategy

Simpler — no hierarchy, no status, no SEO relation on the frozen `Tag` model:

```
POST /tags → name uniqueness → slug resolve → create
PATCH /tags/:id → name/slug/description/synonyms updates
DELETE /tags/:id → reject if used by any Article (via ArticleTag) → soft delete
POST /tags/:id/restore → reject if not deleted → restore
```

## Tree Strategy

"Unlimited nesting" is satisfied **without recursive SQL (CTEs)** — `CategoriesRepository.findAllForSite()` fetches a site's entire (small, in practice) category list in one query, and `utils/category-tree.util.ts` performs all hierarchy operations in memory:

- **`buildTree()`** — groups by `parentId`, recursively attaches children, siblings sorted by `sortOrder` then `name`.
- **`getChildren()`** — direct children only (one level).
- **`getDescendants()`** — every level below, recursive in-memory walk.
- **`getAncestors()`** — walks `parentId` pointers upward, returns root-first.
- **`getBreadcrumb()`** — ancestors + the category itself, root-to-self order.
- **`wouldCreateCycle()`** — true if the proposed new parent is the category itself or one of its own descendants (used exclusively by Move Category).

This avoids any raw SQL and needs no schema change — a pure, fully-unit-tested (39 tests) set of functions operating on a flat array.

## Slug Strategy

Identical rule to Articles, **reused, not duplicated**: `SLUG_SHAPE_PATTERN` was extracted from `modules/articles/utils/slug.util.ts` (exported as a named constant) and imported directly into this module's `SlugShapeValidator`, rather than re-declaring the regex. `normalizeSlug()`/`generateSlugFromTitle()`/`uniquifySlug()` are imported from the same Articles utility file too — zero duplicated slug logic across modules.

- **Auto-generate**: from `name`, uniquified with `-2`, `-3`, ... on collision.
- **Manual override**: normalized, shape-validated, **rejected outright** on collision (never silently renamed).
- **Per-site check**: application-layer only (`findBySlug` scoped by `siteId`, excluding soft-deleted rows), since the DB partial unique index isn't visible from `schema.prisma`.

## Validation

| Rule            | Enforcement                                                                                                                                                                                                                                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Self parent     | `SelfParentException` if `parentId === id` in Move Category                                                                                                                                                                                                                                                                      |
| Circular parent | `wouldCreateCycle()` check against the full site category list                                                                                                                                                                                                                                                                   |
| Deleted parent  | `findById()` excludes soft-deleted rows by default — a soft-deleted parent id is simply "not found"                                                                                                                                                                                                                              |
| Missing parent  | `ParentCategoryNotFoundException` if the given id doesn't resolve                                                                                                                                                                                                                                                                |
| Duplicate slug  | Partial-unique-index-aware application-layer check (see "Slug Strategy")                                                                                                                                                                                                                                                         |
| Duplicate name  | Application-layer check (`findByName`, scoped by site) — **not** a DB constraint (none exists), explicitly application-layer per instruction. Carries the same residual race-condition caveat as Settings' Global scope / User email-username gaps (Conflict #9, stabilization patch) — not closed by a migration in this patch. |
| Invalid status  | `@IsEnum(CategoryStatus)` on the update DTO — only `ACTIVE`/`INACTIVE`, nothing invented                                                                                                                                                                                                                                         |

## Hierarchy

`Category.parent`/`children` (self-relation `"CategoryHierarchy"`) is the only hierarchy relation in the frozen schema — used as-is. Changing a category's parent goes through the dedicated `POST /categories/:id/move` endpoint (not the generic `PATCH`), keeping "rename/describe" and "reparent" as clearly separate operations with independent validation paths.

## Delete Strategy

Both Category and Tag follow the same two-step guard before any soft delete:

1. Reject if `deletedAt` is already set (`*AlreadyDeletedException`).
2. Reject if still in use — Category checks both `Article.primaryCategoryId` usage **and** active children (`CategoryInUseException`, two reasons); Tag checks `ArticleTag` usage (`TagInUseException`).

Only after both checks pass does `softDelete()` run, setting `deletedAt`/`deletedBy` — the same audit-column pattern used everywhere else in this schema.

## Restore Strategy

Symmetric to delete: reject if not currently deleted (`*NotDeletedException`), otherwise clear `deletedAt`/`deletedBy` and set `updatedBy`. No re-validation of uniqueness on restore is performed — if restoring would recreate a slug/name collision with another _active_ row, the partial unique index would reject it at the database level (the one place this module actually relies on the DB constraint rather than only the application-layer check, since restore isn't a normal create/update path with a pre-check built in).

## Search

Both resources support database-only search (`ILIKE` via Prisma's `contains`/`insensitive` mode) — no Elasticsearch/Meilisearch/AI, per instruction:

- **Category**: `search` (name + description), `status`, `parentId`, plus `page`/`limit`/`sortBy`/`sortOrder`.
- **Tag**: `search` (name + description), plus `page`/`limit`/`sortBy`/`sortOrder`.

## SEO

**Never duplicates SEO logic.** `Category` upserts its own `SeoMeta` row exactly the way Articles does (`CategoriesRepository.upsertSeoMeta`, same shape/behavior as `ArticlesRepository.upsertSeoMeta`) — each category's SEO fields upsert its own row, never shared across categories, enforced at the application layer since the schema itself doesn't guarantee 1:1. `Tag` has no `seoMetaId` column at all in the frozen schema, so tags have no SEO relation — not implemented, not faked.

## Permission Flow

| Action                                 | Permission                                         | Policy?                                             |
| -------------------------------------- | -------------------------------------------------- | --------------------------------------------------- |
| Every Category endpoint (read + write) | `category.create` (reused)                         | `TaxonomyPolicy` (Super Admin/Administrator/Editor) |
| Every Tag endpoint (read + write)      | `category.create` (reused — no `tag.*` key exists) | `TaxonomyPolicy`                                    |

`TaxonomyPolicy` provides role-based defense-in-depth on top of the flat permission check already enforced by `PermissionGuard` — unlike `ArticleOwnershipPolicy`, there's no ownership branch, since neither `Category` nor `Tag` has an author-equivalent field.

## API List

**Categories** (`/categories`): `GET /`, `GET /tree`, `GET /flat`, `GET /slug/:slug`, `GET /:id`, `GET /:id/children`, `GET /:id/descendants`, `GET /:id/ancestors`, `GET /:id/breadcrumb`, `POST /`, `PATCH /:id`, `POST /:id/move`, `DELETE /:id`, `POST /:id/restore`.

**Tags** (`/tags`): `GET /`, `GET /slug/:slug`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`, `POST /:id/restore`.

## Future Integrations

Not requested by this milestone's scope, listed for completeness: a `color` field for Tag and a `visibility` field for Category would each require a schema migration (out of scope, not attempted); stored/cached counters (`articleCount`/`usageCount`) would replace the current live-COUNT approach once query performance at scale warrants it; a `category.view`/`tag.view` permission split would follow the same pattern already documented as deferred for Settings/Users in `43_CONFLICT_RESOLUTION.md`.

## Testing

135 new tests across 12 spec files: `category-tree.util` (18), `SlugShapeValidator` (7), `TaxonomyPolicy` (10), `CategoriesMapper` (5), `TagsMapper` (4), `CategoriesRepository` (15), `TagsRepository` (10), `CategoriesService` (24), `TagsService` (15), `CategoriesController` (10), `TagsController` (6), plus 2 DTO specs (`CreateCategoryDto`, `CreateTagDto`, 9 tests). Total: **412 tests / 51 suites** passing workspace-wide (up from 277/38 before this milestone).

## Deferred / Explicitly Out of Scope

Frontend, Admin UI, Public Website UI, Drag & Drop UI, Media Library, Comments, Widgets, Menu Builder, Page Builder, Theme Builder, Workflow Engine, Publishing Queue, Notification Engine, Search Engine, Cache Layer, Analytics, Multi-site/SaaS/Enterprise logic, Tag color, Category visibility/metadata, stored counters, a `category.view`/`tag.view`/`category.restore` permission split.

## Approved Date

Pending — awaiting explicit approval before Milestone 10, per this milestone's own instruction.

## Architecture Status

**IMPLEMENTED, AWAITING APPROVAL** — Category & Tag Foundation (Milestone 9).
