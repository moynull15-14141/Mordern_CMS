# 65_FRONTEND_ARTICLES

Articles Management Module (Frontend Milestone 5). Implements the admin Articles CRUD, publish/schedule workflow, and revision summary against the real `ArticlesController` (`apps/backend/src/modules/articles/controllers/articles.controller.ts`).

**Status: Implemented, awaiting approval.**

## Architecture

`features/articles/` follows the established `components/hooks/services/schemas/types/constants` shape (Frontend Milestones 3–4), reusing `DataTable`, `Form`/`FormControl`, `ConfirmDialog`, `PermissionRoute`/`PermissionGate`, `EmptyState`/`ErrorState`/`Skeleton`, `lib/api-client.ts` unchanged. No backend or shared-component change. Two additive constants changes: `API_ENDPOINTS.ARTICLES`/`CATEGORIES` restructured from bare strings to path-builder objects (no existing call sites referenced the old shape); `ARTICLE_ROUTES` added to `constants/routes.ts`.

Category/Tag/Media selectors are thin, single-purpose service files inside `features/articles/services/` (`categories.api.ts`, `tags.api.ts`, `media.api.ts`) — not full Categories/Tags/Media features, which are out of this milestone's scope.

## API Mapping

| Function | Method + Path |
|---|---|
| `articlesApi.list` | `GET /articles` (paginated) |
| `articlesApi.get` | `GET /articles/:id` |
| `articlesApi.getBySlug` | `GET /articles/slug/:slug` |
| `articlesApi.create` | `POST /articles` |
| `articlesApi.update` | `PATCH /articles/:id` |
| `articlesApi.remove` | `DELETE /articles/:id` |
| `articlesApi.restore` | `POST /articles/:id/restore` |
| `articlesApi.publish` | `POST /articles/:id/publish` |
| `articlesApi.schedule` | `POST /articles/:id/schedule` |
| `articlesApi.listRevisions` | `GET /articles/:id/revisions` |
| `articlesApi.compareRevisions` | `GET /articles/:id/revisions/compare` |
| `articlesApi.restoreRevision` | `POST /articles/:id/revisions/:version/restore` |
| `categoriesApi.listFlat` | `GET /categories/flat` |
| `tagsApi.list` | `GET /tags` |
| `mediaApi.list` | `GET /media` |

No bulk endpoint exists on `ArticlesController` — no bulk-selection UI was built. `compareRevisions`/`restoreRevision` are wired in the service layer (real endpoints) but not yet surfaced in the UI (list-only revision summary this milestone).

## Implemented Features

- **List** (`/articles`): server pagination/search/sort, filters for Status, Visibility, Category, Tag, Author id. No bulk selection (no backend support).
- **Create** (`/articles/new`): React Hook Form + Zod mirroring `CreateArticleDto`. Slug optional (auto-generated server-side if blank). Category selector (`GET /categories/flat`), Tag multi-select (`GET /tags`), Featured Image picker (`GET /media`, list-only — see Limitations), SEO section, dirty tracking. One submit action ("Create article") — `CreateArticleDto` has no `status` field, so there is no separate Publish/Save-Draft choice at creation.
- **Edit** (`/articles/[id]/edit`): loads the article, `PATCH`-based update restricted to DRAFT/REVIEW/ARCHIVED (`GENERIC_UPDATE_ALLOWED_STATUSES`), dirty tracking + discard-changes confirmation, pessimistic save (navigates to Detail on success).
- **Detail** (`/articles/[id]`): read-only metadata/SEO/category/tags/author, revision list (`GET /articles/:id/revisions`), and the real workflow actions — Edit, Delete/Restore, Publish (`POST /:id/publish`), Schedule (`POST /:id/schedule`, future-date validated).
- Permission-gated throughout: list/detail use `RequireAnyPermission` across all 4 article permissions (matching the backend); write actions use `article.create`/`article.update`/`article.delete`/`article.publish` individually.

## Known Limitations

- **No Authors module exists.** `CreateArticleDto.authorId`/`ArticleQueryDto.authorId` are real UUID fields, but no endpoint lists Author records — both the Create form's Author field and the List's Author filter are plain UUID text inputs, not pickers.
- **Category/Tag/Media endpoints are gated by permissions an Article author may not hold.** `CategoriesController`/`TagsController` require `category.create`; `MediaController`'s list requires `media.upload` or `media.delete`. A user with only `article.create` sees those three selectors degrade to a permission message or plain id input rather than crash.
- **No resolvable media URL.** `MediaResponseDto` has no public URL field (only an internal `storageKey`) — the Featured Image picker lists filename/type/dimensions only, no real thumbnails.
- **Content editor is a plain-text placeholder.** No rich editor integration (explicitly out of scope). `body` is stored as `{ text: string }`; any other `body` shape (e.g. future rich-editor output) is shown as raw JSON on the Edit form rather than silently dropped.
- **SEO section covers only the simple `ArticleSeoDto` fields** (title/description/canonicalUrl/keywords). `openGraph`/`twitterCard`/`schemaJson`/`robots`/`extraMeta` are real DTO fields but raw JSON blobs with no structured editor here.
- **No revision diff viewer or revision-restore UI.** The Detail page lists revisions; `compareRevisions`/`restoreRevision` are implemented in the service layer but not wired to any UI control this milestone.
- **No true autosave.** No endpoint supports saving a draft before an article has an id; autosave-on-create is therefore not possible. Edit-page autosave (via periodic `PATCH`) was also not built — out of this milestone's scope.
- **`primaryTagId`** (which selected tag is "primary") is a real DTO field, not exposed by any UI control — every selected tag is sent as a plain `tagIds` entry.

## Future Integration

An Authors module would let the Author field/filter become a real picker with no other change needed. A Categories/Tags/Media milestone would let this feature's inline selector services be replaced by that feature's public hooks. A rich content editor would replace the `bodyText` placeholder and its `{ text }` wrapping in `create-article.schema.ts`/`update-article.schema.ts`/the two page-content transform functions — `body`'s `Record<string, unknown>` shape on the DTO already accommodates any future document tree with no backend change.
