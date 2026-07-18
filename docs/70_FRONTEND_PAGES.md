# Frontend — Pages Management

## Architecture

`apps/admin/src/features/pages/` mirrors `features/articles/` exactly
(types/services/hooks/constants/schemas/components), scoped down to what
`PagesController` actually exposes: title, slug, body (placeholder plain-
text textarea, same as Articles — no rich editor exists anywhere in this
codebase yet), status, seo. No author/category/tags/visibility/language/
locale — none of those exist on the `Page` model.

Routes: `/pages`, `/pages/new`, `/pages/[id]`, `/pages/[id]/edit` — nothing
more. Nav entry added under "Content" (gated by `page.manage`).

## API Mapping

| Endpoint                  | Service fn           | Hook                                                                  |
| ------------------------- | -------------------- | --------------------------------------------------------------------- |
| `GET /pages`              | `pagesApi.list`      | `usePages`                                                            |
| `GET /pages/slug/:slug`   | `pagesApi.getBySlug` | — (unused; no route needs it, kept for parity with the real endpoint) |
| `GET /pages/:id`          | `pagesApi.get`       | `usePage`                                                             |
| `POST /pages`             | `pagesApi.create`    | `useCreatePage`                                                       |
| `PATCH /pages/:id`        | `pagesApi.update`    | `useUpdatePage`                                                       |
| `DELETE /pages/:id`       | `pagesApi.remove`    | `useDeletePage`                                                       |
| `POST /pages/:id/restore` | `pagesApi.restore`   | `useRestorePage`                                                      |
| `POST /pages/:id/publish` | `pagesApi.publish`   | `usePublishPage`                                                      |

One function per real endpoint, no invented helper/bulk APIs — verified
against `apps/backend/src/modules/pages/controllers/pages.controller.ts`.

## Implemented Features

- Pages List: server pagination/search(title)/sort/filter(status) via the shared `DataTable`. Columns: Title/Slug, Status, Published, Updated, Actions.
- Create Page: mirrors `CreatePageDto` (title, slug auto/manual, body, seo). No status choice — server assigns DRAFT.
- Edit Page: mirrors `UpdatePageDto` (status restricted to DRAFT/REVIEW/ARCHIVED). Dirty tracking + discard-confirmation dialog on Cancel. Pessimistic mutation (no optimistic cache write, matching `useUpdateArticle`).
- Detail Page: metadata (slug, published, created, updated), SEO summary, Edit/Publish/Delete/Restore actions gated by `page.manage`.
- Publish: `PublishDialog` → `POST /pages/:id/publish`, immediate only — no scheduling UI (no backend support).
- Delete/Restore: soft delete + restore via `DeleteDialog`/`RestoreDialog`, same pattern as Articles.
- SEO: `features/pages/components/seo-fields.tsx` — a page-scoped copy of the simple title/description/canonicalUrl/keywords editor, mirroring `features/articles/components/seo-fields.tsx` exactly (duplicated per established `features/*` convention — Categories does the same rather than cross-importing Articles'). The standalone SEO Intelligence Center (`features/seo`) was **not** wired to Pages — see Backend Limitations.

## Backend Limitations

1. **No `GET /seo/page/:id` endpoint** — the SEO module (`features/seo`) only supports `byArticle`/`byCategory` lookups. The richer SEO Intelligence Center (score ring, previews, checklist) could not be reused for Pages without inventing an endpoint; the embedded simple SEO fields (same as Articles/Categories) were used instead.
2. **No hierarchy** — no parent/child page tree, no breadcrumb, no parent selector (`Page` has no `parentId`).
3. **No scheduling** — no Schedule dialog/action (`Page` has no `scheduledAt`).
4. **No revisions** — no revision history section on the Detail page (`Page` has no revision model).
5. **No author/visibility/language/locale fields** — none rendered anywhere (not on the `Page` model).

## Testing

81 new tests: services (9), hooks (10), schemas (20), components (42 across status-badge, dialogs, filters, table, form, and all 4 page-content compositions). Combined with the 30 backend Pages tests from the prior milestone, **111 total tests** for the Pages feature.

## Validation

`tsc --noEmit`: 0 errors. `eslint --max-warnings=0` on all new/modified files: 0 warnings. `vitest run` (pages feature): 23 files / 81 tests pass. Full admin suite re-run for regressions (see final report).

## Future Integration

If a future milestone adds `GET /seo/page/:id` to the backend SEO module, the Detail/Edit pages here can be upgraded to embed the full `features/seo` Intelligence Center the same way it would bind to Articles/Categories — no other Pages code would need to change.

## Cross References

- Backend: `docs/69_BACKEND_PAGES.md`
- SEO module: `docs/68_FRONTEND_SEO.md`
- Articles (pattern source): `docs/65_FRONTEND_ARTICLES.md`
