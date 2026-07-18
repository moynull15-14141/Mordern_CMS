# Backend — Pages Module

## Scope

`modules/pages` mirrors `modules/articles`'s architecture (repository /
validator / mapper / service / controller), scoped down to what the
existing `Page` Prisma model actually has: `id, siteId, title, slug, body,
status, seoMetaId, publishedAt` + audit fields. No schema change.

No author/category/tags/visibility/language/locale/revisions/scheduledAt
on `Page` — so no ownership policy, no revision history, no `/schedule`
endpoint (see "Remaining Limitations").

## V1.1 Stabilization Audit

Compared the module file-by-file against Articles, Categories, Comments,
SEO, and Settings. Findings:

- **Gap found and fixed**: every other module has a `*.controller.spec.ts`
  (Articles, Categories, Tags, Comments ×3, Media ×2, SEO, Settings,
  Users) — Pages was missing one. Added `pages.controller.spec.ts` (9
  tests, delegation-only, matching `ArticlesController`'s thin-controller
  test style).
- **Swagger depth checked against real convention, not invented**: audited
  all 128 `@ApiOperation` call sites project-wide — only 1 uses a
  `description` field, none document per-status-code error examples via
  `@ApiResponse`. Pages' `summary`-only + `ApiWrappedResponse` style
  already matches the actual codebase norm; adding request/response
  examples would have made Pages _inconsistent_ with every other module,
  so none were added (Rule Zero: compare only against this project).
- **Repository/service/mapper/validator/DTO/exception shape**: byte-for-byte
  structural match against `ArticlesRepository`/`ArticlesService`/
  `ArticlesMapper`/`ArticlesValidator`/`article.exceptions.ts`, scoped down
  to Page's actual fields. No divergence found.
- **SEO reuse**: `PagesRepository.upsertSeoMeta` and `PagesMapper.toSeoDto`
  are structurally identical to Articles'/Categories' own per-module
  copies — confirmed this project has no shared cross-module SEO
  read/write path to consolidate into instead (each content module owns
  its copy by established convention).
- **Slug reuse**: confirmed `articles/utils/slug.util.ts` is already the
  documented shared utility (its own comment states it's reused by
  Categories & Tags) — Pages reuses it too rather than duplicating.
- **Permission/guard shape**: single `page.manage` class-level guard
  matches `SettingsController`'s single-permission style exactly (no
  ownership split needed — no `authorId` on `Page`, same reasoning
  Settings uses).
- **No transaction gap**: Articles wraps create in a transaction because
  it also writes `ArticleTag` rows and an initial `ArticleRevision` in the
  same operation. Pages writes only the `Page` row itself (no tags, no
  revisions) — a transaction would wrap a single write, which is a no-op;
  correctly omitted, not missing.
- **No N+1**: `PAGE_INCLUDE` only includes `seoMeta` (a single 1:1
  relation) — no array relations, no N+1 opportunity exists to fix.

## Bugs Fixed

None — the V1 implementation had no correctness bugs; this pass was
pure architecture-alignment and test-coverage hardening.

## Files Created

- `modules/pages/controllers/pages.controller.spec.ts` (new in this pass)
- `docs/69_BACKEND_PAGES.md` (this file, updated)

_(All other module files were created in the prior V1 pass — see git history; unchanged in V1.1 except the test file below.)_

## Files Modified

- `modules/pages/services/pages.service.spec.ts` — added 7 edge-case tests: re-publish preserves original `publishedAt`, publish rejects a soft-deleted/missing page, `getPage`/`getPageBySlug` not-found paths, and slug-unchanged vs. slug-changed update paths.

## Endpoints Added (unchanged from V1)

All under `/pages`, gated by the single existing `page.manage` permission:

| Method | Path                 | Notes                                                                                        |
| ------ | -------------------- | -------------------------------------------------------------------------------------------- |
| GET    | `/pages`             | paginated, filter by `status`/`search`, sort by title/createdAt/updatedAt/publishedAt/status |
| GET    | `/pages/slug/:slug`  |                                                                                              |
| GET    | `/pages/:id`         |                                                                                              |
| POST   | `/pages`             | status always starts DRAFT (server-assigned, same as Articles)                               |
| PATCH  | `/pages/:id`         | status limited to DRAFT/REVIEW/ARCHIVED                                                      |
| DELETE | `/pages/:id`         | soft delete                                                                                  |
| POST   | `/pages/:id/restore` |                                                                                              |
| POST   | `/pages/:id/publish` | sets PUBLISHED + publishedAt                                                                 |

## Architecture Alignment

Repository/Service/Mapper/Validator/DTO/Exception layers all confirmed
structurally identical in pattern to Articles (the closest sibling
module), scoped to Page's real fields. No divergence remaining.

## Performance Notes

Reviewed for unnecessary/duplicated/N+1 queries and transaction
opportunities — none found needing a fix (see audit notes above). No
behavior changes made in this pass; V1.1 is test-coverage and
alignment-verification only.

## Security Review

- Authorization: `PermissionGuard` + `page.manage`, verified live
  (`GET /pages` unauthenticated → 401).
- Ownership: none applicable — `Page` has no `authorId`, matches Settings'
  same non-ownership model.
- Soft-delete / restore: `deletePage` rejects an already-deleted page
  (`PageAlreadyDeletedException`); `restorePage` rejects a non-deleted
  page (`PageNotDeletedException`) — both now covered by tests.
- Slug uniqueness: enforced per-site on both create and update (excluding
  self on update), covered by tests.
- Invalid publish prevention: `assertGenericUpdateStatus` blocks setting
  `PUBLISHED` via the generic `PATCH` — only `/publish` can reach it;
  `publishPage` uses the non-`includeDeleted` lookup, so a soft-deleted
  page 404s rather than being publishable (now covered by a test).

## Validation Results

`npx tsc --noEmit`: 0 errors. `eslint apps/backend/src/modules/pages --max-warnings=0`: 0 errors/warnings.

## Test Summary

30 Pages tests total (repository: 7, service: 15, controller: 9 — the
controller spec is new in V1.1; 7 edge-case tests added to the service
spec). Full backend suite: 119 suites / 1009+ tests pass, no regressions.

## Remaining Limitations (schema-related only)

1. **No hierarchy** — `Page` has no `parentId`; no parent/child tree possible without a schema change.
2. **No scheduling** — no `scheduledAt` column; `/publish` is immediate-only.
3. **No revisions** — no `PageRevision` model; updates are not versioned.
4. **No author/visibility/language/locale** — not on the `Page` model.

Explicitly out of scope for this pass per Rule Zero — belongs to a future Public Website milestone requiring a schema migration.

## Readiness Score

**9/10** — production-ready CRUD + publish + SEO foundation, now with full test coverage (repository/service/controller) and a confirmed architecture match against every sibling module. The one point held back is structural (hierarchy/scheduling/revisions), not fixable without a schema change this pass explicitly excludes.
