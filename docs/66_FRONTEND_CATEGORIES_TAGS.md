# 66_FRONTEND_CATEGORIES_TAGS

Categories & Tags Management Module (Frontend Milestone 6). Implements the admin Categories (hierarchical) and Tags (flat) CRUD against the real `CategoriesController`/`TagsController` (`apps/backend/src/modules/categories/controllers/`).

**Status: Implemented, awaiting approval.**

## Architecture

Two feature directories — `features/categories/` and `features/tags/` — each following the established `components/hooks/services/schemas/types/constants` shape (Frontend Milestones 3–5), reusing `DataTable`, `Form`/`FormControl`, `ConfirmDialog`, `PermissionRoute`/`PermissionGate`, `EmptyState`/`ErrorState`/`Skeleton`, `Tabs`, `lib/api-client.ts` unchanged. No backend or shared-component change. `API_ENDPOINTS.CATEGORIES`/`TAGS` (Frontend Milestone 5 introduced these as bare/partial objects for the Articles selectors) were extended with the remaining real sub-paths; `CATEGORY_ROUTES`/`TAG_ROUTES` added to `constants/routes.ts`.

A single reusable `CategoryTree` component (`features/categories/components/category-tree.tsx`) renders `GET /categories/tree`'s nested structure — expand/collapse, current-node and ancestor-path highlighting, all local state. `features/articles/services/tags.api.ts` (Frontend Milestone 5's lightweight tag *selector*) is untouched and distinct from this milestone's full `features/tags/services/tags.api.ts` CRUD service — different files, different purposes, no collision.

`CategorySeoFields`/`TagResponseDto` has no SEO — Categories' SEO subform (`category-seo-fields.tsx`) is a deliberate duplicate of Articles' `seo-fields.tsx` (same shape, same simplification to title/description/canonicalUrl/keywords) rather than a cross-feature import, keeping every `features/*` directory self-contained per the established convention.

## API Mapping

| Function | Method + Path |
|---|---|
| `categoriesApi.list` | `GET /categories` (paginated) |
| `categoriesApi.getTree` | `GET /categories/tree` |
| `categoriesApi.getFlat` | `GET /categories/flat` |
| `categoriesApi.getBySlug` | `GET /categories/slug/:slug` |
| `categoriesApi.get` | `GET /categories/:id` |
| `categoriesApi.getChildren` | `GET /categories/:id/children` |
| `categoriesApi.getDescendants` | `GET /categories/:id/descendants` |
| `categoriesApi.getAncestors` | `GET /categories/:id/ancestors` |
| `categoriesApi.getBreadcrumb` | `GET /categories/:id/breadcrumb` |
| `categoriesApi.create` | `POST /categories` |
| `categoriesApi.update` | `PATCH /categories/:id` (never sends `parentId`) |
| `categoriesApi.move` | `POST /categories/:id/move` |
| `categoriesApi.remove` | `DELETE /categories/:id` |
| `categoriesApi.restore` | `POST /categories/:id/restore` |
| `tagsApi.list` | `GET /tags` (paginated) |
| `tagsApi.getBySlug` | `GET /tags/slug/:slug` |
| `tagsApi.get` | `GET /tags/:id` |
| `tagsApi.create` | `POST /tags` |
| `tagsApi.update` | `PATCH /tags/:id` |
| `tagsApi.remove` | `DELETE /tags/:id` |
| `tagsApi.restore` | `POST /tags/:id/restore` |

No bulk endpoint exists on either controller. Every endpoint on both controllers — Categories and Tags — is gated by the single `category.create` permission (no `category.view`/`category.delete`/`category.restore`/`tag.*` permission exists in the frozen vocabulary); `getAncestors` is implemented in the service layer but not yet surfaced in any UI (breadcrumb already covers the common "path to root" need).

## Implemented Features

**Categories**
- **List/Tree toggle** (`/categories`): List uses `GET /categories` (server pagination/search/status filter/sort); Tree uses `GET /categories/tree` via `CategoryTree` (expand/collapse, current-node + ancestor highlighting). View/page/sort/filter/search state lives in the URL.
- **Create** (`/categories/new`): name/slug/description/parent (`ParentCategorySelect`, `GET /categories/flat`)/sort order/SEO, dirty tracking. No `status` field (`CreateCategoryDto` has none).
- **Edit** (`/categories/[id]/edit`): name/slug/description/status/sort order/SEO — no parent field (parent changes only via the dedicated Move dialog, matching the backend's own `PATCH`/`POST /move` split).
- **Detail** (`/categories/[id]`): metadata, breadcrumb (`GET /:id/breadcrumb`), article count, children count, direct children list (`GET /:id/children`), SEO, Edit/Move/Delete/Restore actions.
- **Move dialog**: `POST /:id/move`, excludes the category itself and every descendant (`GET /:id/descendants`) from the parent selector — the backend is itself circular-reference safe, but this prevents an invalid choice from ever being offered.

**Tags**
- **List** (`/tags`): `GET /tags` server pagination/search/sort.
- **Create/Edit/Detail** (`/tags/new`, `/tags/[id]/edit`, `/tags/[id]`): name/slug/description/synonyms, usage count, dirty tracking. No SEO section, no color field — neither exists on the backend.
- Delete/Restore on both List and Detail, mirroring Categories' dialogs.

Permission-gated throughout with the single real `category.create` key — no finer-grained permission invented for either resource.

## Known Limitations

- **`CategoriesController`/`TagsController` are entirely gated by `category.create`** — a user with a narrower role sees a graceful permission message in the parent-category selector (`ParentCategorySelect`) rather than an invented fallback; the rest of both features are simply unreachable for such a user (the same coarse-permission shape Settings established in Frontend Milestone 4).
- **Tags have no SEO capability at all** — `TagResponseDto`/`CreateTagDto`/`UpdateTagDto` have no `seo` field. The brief's "SEO information" bullet for Tags does not apply; not a gap in this implementation.
- **No "Visibility" field on Category** — only `status` (ACTIVE/INACTIVE) exists; no separate visibility concept on the backend.
- **SEO section (Categories) covers only the simple fields** (title/description/canonicalUrl/keywords) — `openGraph`/`twitterCard`/`schemaJson`/`robots`/`extraMeta` are real DTO fields but raw JSON blobs with no structured editor here (same scope decision as Articles' SEO section).
- **`getAncestors` is unused in the UI** — the Breadcrumb already satisfies the "path to root" need requested in the brief; a full ancestor-chain view was not separately built.
- Both `/tags/new` and a separate `/tags/[id]/edit` route are built per this milestone's explicit page list, even though `docs/56_ADMIN_FRONTEND_ARCHITECTURE.md`'s route tree only lists a bare `tags/page.tsx` + `tags/[id]/page.tsx` — the same kind of route-tree-omission-is-not-a-prohibition precedent already established for Settings (Frontend Milestone 4) and Articles' separate edit routes (Frontend Milestone 5, deviating from `docs/56`'s single-page-per-id sketch).

## Future Integration

If a future backend release adds `category.view`/`category.delete`/`tag.*`-specific permissions, every `PermissionGate`/`PermissionRoute` call site here already isolates the single `PERMISSIONS.CATEGORY_CREATE` reference — swapping to finer-grained keys touches only those call sites, not the underlying components. If Tags ever gain an `seo` field, `CategorySeoFields` can be copied into `features/tags/components/` with no other change needed (the pattern is already proven for Categories/Articles). `getAncestors`/`compareRevisions`-style "full path" UI, and a real diff/restore view for Categories (there is no revision history for Categories/Tags on the backend, unlike Articles), remain open for a future milestone if the backend ever adds one.
