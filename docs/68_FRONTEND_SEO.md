# Frontend Milestone 9 — SEO Intelligence Center

## Scope

Standalone SEO admin surface at `/seo` (`apps/admin/src/app/(dashboard)/seo/page.tsx`),
gated by `seo.manage`. Operates on the real `SeoMeta` rows already linked to an
Article or Category (created via the existing embedded SEO tabs on the
article/category forms, which server-derive `siteId`).

## Files Created

- `features/seo/types/seo.ts` — mirrors `SeoFieldsDto`/`SeoResponseDto`/`SeoWarning`.
- `features/seo/services/seo.api.ts` (+ `.test.ts`) — one function per real `SeoController` endpoint.
- `features/seo/hooks/query-keys.ts`, `use-seo-for-entity.ts`, `use-update-seo.ts`, `use-seo-validate.ts`, `use-seo-preview.ts`.
- `features/seo/lib/seo-score.ts` (+ `.test.ts`) — frontend-only 0-100 score/status/checklist (backend computes warnings, not a score).
- `features/seo/schemas/seo-editor.schema.ts` — Zod, mirrors `SeoFieldsDto` constraints exactly.
- `features/seo/components/`: `seo-score-ring.tsx`, `seo-status-badge.tsx`, `character-counter.tsx`, `seo-checklist.tsx`, `seo-issue-list.tsx`, `seo-health-panel.tsx`, `google-preview.tsx`, `facebook-preview.tsx`, `twitter-preview.tsx`, `slug-analyzer.tsx`, `seo-editor-form.tsx`, `seo-entity-picker.tsx`, `seo-intelligence-center.tsx`.
- `docs/68_FRONTEND_SEO.md` (this file).

## Files Modified

- `constants/api-endpoints.ts` — `SEO` changed from a bare string to sub-path builders (`byId`, `byArticle`, `byCategory`, `UPSERT`, `PREVIEW`, `VALIDATE`, `restore`). No prior call site existed.
- `app/(dashboard)/seo/page.tsx` — replaced `ComingSoonPage` placeholder with the real Intelligence Center.

## Features Implemented

- Entity picker (search real Articles via `GET /articles?search=`, Categories via `GET /categories/flat`).
- Live SEO Score Ring (0-100), Status Badge (Excellent/Good/Needs Improvement/Poor), Passed/Warnings/Errors/Completion %.
- Live SEO Checklist (title, description, canonical, OG, Twitter, featured image, slug, robots, schema, alt text) — updates on every keystroke via RHF `watch()` subscription.
- SEO Editor: title, description, keywords, canonical URL, robots (index/follow), Open Graph (title/description/image), Twitter Card (type/title/description/image), Schema JSON-LD (raw JSON textarea).
- Google / Facebook / Twitter live preview cards.
- Character counters (green/yellow/red) for title (10-60) and description (50-160), thresholds matching the backend's own constants.
- Slug Analyzer (lowercase/hyphenated/readable/length) — frontend-only.
- Issue List grouped Critical/Warning/Suggestion, click-to-scroll to the matching editor section.
- Save via `PATCH /seo/:id`.

## Validation

- Zod schema mirrors `SeoFieldsDto` (`title` ≤200, `description` ≤500, `canonicalUrl` must be a valid URL).
- Score/checklist thresholds mirror `seo.constants.ts` (title 10-60, description 50-160) so the UI never disagrees with `POST /seo/validate`.
- `POST /seo/validate` and `POST /seo/preview` services/hooks are built (`use-seo-validate.ts`, `use-seo-preview.ts`) for future wiring; not called from the current UI to keep the milestone's live-scoring path purely client-side and dependency-free of network latency — real endpoints, unused hooks are harmless and match the "one endpoint = one service" rule.

## Test Summary

- `seo.api.test.ts` — 11 tests, one per real endpoint + a negative test asserting no invented `list()`.
- `seo-score.test.ts` — 4 tests covering empty/full/partial scoring.
- Full suite: `npx vitest run` — all existing + new tests pass. `npx tsc --noEmit` — 0 errors. `eslint --max-warnings=0` on all new/modified files — 0 warnings.

## Remaining Backend Limitations

1. **No `GET /seo` list endpoint** — only lookup by `id`/`articleId`/`categoryId`. The Intelligence Center is entity-scoped (via a real Articles/Categories search), not a standalone SEO table.
2. **No `/sites` endpoint** — `CreateSeoDto`/`UpsertSeoDto` require a `siteId` the frontend cannot resolve (the backend derives it server-side via `getDefaultSite()` only inside the Articles/Categories write paths). `seoApi.create`/`upsert` exist (real endpoints) but are **not wired into the UI** — creating a new `SeoMeta` row from a blank state isn't safely reachable from this module. Entities with no SEO yet show an empty state directing the user to the article/category edit form instead.
3. **No slug-duplicate-check endpoint** — Slug Analyzer omits the "duplicate warning" listed in the brief; only static format rules are checked.
4. **No numeric SEO score on the backend** — `analyzeSeo()` returns warnings only; the 0-100 score/status shown here is computed entirely client-side.

## Readiness Score

**8.5/10** — full editor/preview/health/checklist experience for any entity with an existing `SeoMeta` row; blocked from being a fully standalone CRUD surface only by the two missing backend endpoints (`/seo` list, `/sites`) noted above.
