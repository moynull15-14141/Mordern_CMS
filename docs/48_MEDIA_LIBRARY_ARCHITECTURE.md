# 48_MEDIA_LIBRARY_ARCHITECTURE

## Executive Summary

Media Library Foundation (Milestone 10). Mirrors `47_CATEGORY_TAG_ARCHITECTURE.md`'s role for its module: from this point forward, `apps/backend/src/modules/media/` is the literal implementation of what this document describes. **Backend foundation only** — no Uploader UI, Image Crop/Resize/Compression/Optimization, CDN, S3/R2/MinIO/Azure/GCS, Video Streaming, Audio Processing, OCR, AI Image Recognition, Background Worker/Queue, Thumbnail Generator.

**Architecture Status at time of writing: awaiting approval.**

## Folder Structure

```
media/
├── controllers/   — MediaController, MediaFolderController (one module, two controllers/resources)
├── services/      — MediaService, MediaFolderService
├── repositories/  — MediaRepository (MediaAsset CRUD + usage detection), MediaFolderRepository (MediaFolder CRUD)
├── validators/    — MediaValidator (mime/filesize/storageKey — reuses Settings; SlugShapeValidator re-provided from Categories)
├── mappers/       — MediaMapper, MediaFolderMapper
├── policies/      — MediaOwnershipPolicy (first real implementation of the existing MediaPolicy)
├── dto/           — 17 files across both resources
├── interfaces/    — MediaAssetMetadata, MediaQueryFilters/Options, MediaFolderQueryFilters/Options, MediaUsageReference
├── constants/     — MediaSortField, MediaFolderSortField, slug length limits, MIME-type-prefix map
├── exceptions/    — 17 exception classes across both resources
└── media.module.ts
```

`MediaFolder`'s tree operations (`buildTree`/`getChildren`/`getDescendants`/`getAncestors`/`getBreadcrumb`/`wouldCreateCycle`) are **not reimplemented** — this milestone genericized `modules/categories/utils/category-tree.util.ts` (previously typed concretely to `Category`) into a generic `<T extends HierarchyNode>` set of pure functions, verified against Categories' full existing 18-test suite (zero regressions) before reuse here. `TaxonomyPolicy` (Categories) is imported directly for `MediaFolder`'s role-tier checks, for the same reason: neither `Category` nor `MediaFolder` has an ownership concept.

## Conflicts Found (reported before implementation, summarized here for the record)

1. **`MediaAsset` has no folder-linkage field at all** — `MediaFolder`'s hierarchy exists independently. Resolved by storing the reference in the existing generic `MediaAsset.metadata: Json?` column (`metadata.folderId`), the same JSON-column-reuse pattern established for Settings/Users, and now applied here since `MediaAsset` — unlike `Category`/`Tag` — actually has a generic metadata column to reuse.
2. **`MediaAsset` has no display-name column** — only the immutable `storageKey`. "Rename" updates a logical `metadata.filename` instead; `storageKey` is never mutated by this module.
3. **No content-hash column exists** — "Duplicate Detection" is heuristic (`mimeType` + `filesize` match), explicitly documented as such, not byte-exact.
4. **`ArticleRevision` has no queryable link to `MediaAsset`** — usage detection covers the four structurally real sources only (`User.profileImageId`, `Author.profileImageId`, `Article.featuredMediaId`, `ArticleMedia.mediaAssetId`); media referenced only inside rich-text JSON is not detectable and isn't claimed to be. `Category`/`Page`/`Menu` remain correctly "future" — none reference `MediaAsset` today.
5. **Both `media_assets.storageKey` and `media_folders.slug` uniqueness are partial/soft-delete-aware indexes**, invisible from `schema.prisma` alone — same pattern as every prior milestone.
6. **Permission vocabulary clarification**: `media.upload`/`media.delete` already exist and are reused; `media.view`/`media.restore` genuinely don't exist and weren't invented. Reads use `RequireAnyPermission(media.upload, media.delete)`; restore reuses `media.delete`.
7. **`StorageProvider`/`CacheProvider` interfaces already exist**, zero implementation, zero DI bindings — neither is injected anywhere in this module (nothing is registered in Nest's container for them); deleting a `MediaAsset` only ever soft-deletes the DB row.
8. **`MediaPolicySubject` needed no extension** — `MediaAsset.uploadedBy` already references `User.id` directly (unlike Article's indirect `Author.userId` chain), so the frozen shape was sufficient as-is.
9. **`MediaFolder` has no owner concept** — `TaxonomyPolicy` is reused from Categories rather than writing a near-duplicate.
10. **Reuse opportunity applied**: `SettingCategory.MEDIA`'s existing `maxUploadSizeMb`/`allowedMimeTypes` (Milestone 6) are consulted via `SettingsService`, not hardcoded or duplicated.

## Media Strategy

```
POST /media → validate storageKey shape, mimeType/type consistency, mimeType allow-list (Settings), filesize limit (Settings)
            → validate folder (if given) exists → check storageKey uniqueness → create (metadata.folderId/filename if given)
GET /media/:id | /media/slug search / list → read-only, RequireAnyPermission(media.upload, media.delete)
PATCH /media/:id → altText/caption/credit/status only (ownership-gated)
POST /media/:id/rename → metadata.filename only (ownership-gated)
POST /media/:id/move → metadata.folderId only, validates target folder exists (ownership-gated)
POST /media/:id/copy-metadata → copies altText/caption/credit/filename from :id onto {targetId} (ownership-gated on target)
DELETE /media/:id → reject if any usage detected → soft delete (ownership-gated)
POST /media/:id/restore → reject if not deleted → restore (ownership-gated)
```

No file bytes are ever read, transferred, or stored by this module — every "upload" is metadata registration only, per instruction.

## Folder Strategy

Identical shape to Categories' Category CRUD (this milestone's genericized tree utility made that literal code reuse possible): create/update/delete/restore + a dedicated `/move` endpoint for reparenting, kept separate from the generic update. Delete is guarded against both active children **and** active asset references (`metadata.folderId` matches), mirroring Category's article-usage-and-children guard from Milestone 9.

## Storage Strategy

`StorageProvider`/`StorageProviderType` (`core/interfaces/storage-provider.interface.ts`) and `CacheProvider`/`CacheProviderType` (`core/interfaces/cache-provider.interface.ts`) already existed before this milestone — pure contracts, zero implementations. This module **does not implement either** and **does not inject them** (nothing is bound in Nest's DI container for them; attempting `@Inject()` would throw at bootstrap). They are referenced here only as documented future integration points:

- A future concrete `StorageProviderType.R2` (or other) implementation would be called from `MediaService.deleteMediaAsset()` (to actually remove the object at `storageKey`) and from a future upload endpoint (to actually place bytes at a generated `storageKey` before this module's `POST /media` registers the row) — neither call exists today.
- A future `CacheProvider` implementation could cache `GET /media/:id`/list results — no caching exists today; every read hits PostgreSQL directly.

## Usage Strategy

`MediaService.computeUsages()` queries, in parallel, the four real structural reference points:

| Source                  | Query                                           | Detects                                        |
| ----------------------- | ----------------------------------------------- | ---------------------------------------------- |
| `User.profileImage`     | `User.count/findMany({ profileImageId })`       | User avatars (Milestone 7)                     |
| `Author.profileImage`   | `Author.count/findMany({ profileImageId })`     | Author profile images                          |
| `Article.featuredMedia` | `Article.count/findMany({ featuredMediaId })`   | Article featured images (Milestone 8)          |
| `ArticleMedia`          | `ArticleMedia.count/findMany({ mediaAssetId })` | Article gallery/body-media links (Milestone 8) |

All four exclude soft-deleted parent rows. `GET /media/:id/usages` returns the full list; `DELETE /media/:id` uses the same computation to decide whether deletion is allowed at all. **Not detected** (documented, not silently ignored): media referenced only inside `Article`/`ArticleRevision`'s free-form JSON `body` content, and any future `Category`/`Page`/`Menu` reference (none exists in the schema today).

## Validation Strategy

| Rule                           | Enforcement                                                                                                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Filesize within limit          | `MediaValidator.assertFilesizeWithinLimit()` — reads `SettingCategory.MEDIA`'s `maxUploadSizeMb` via `SettingsService`, not hardcoded                                                 |
| MIME type allowed              | `MediaValidator.assertMimeTypeAllowed()` — reads `allowedMimeTypes` via `SettingsService`; empty list means unrestricted                                                              |
| MIME/type consistency          | `MediaValidator.assertMimeTypeMatchesType()` — cross-field check only (declared `type` vs declared `mimeType` prefix), never inspects real file bytes; `DOCUMENT` has no fixed prefix |
| Storage key shape              | `MediaValidator.assertStorageKeyShape()` — non-empty, no path traversal (`..`), no leading slash                                                                                      |
| Slug shape (folders)           | `SlugShapeValidator` (re-provided from Categories, not duplicated)                                                                                                                    |
| Duplicate slug/storageKey      | Application-layer, partial-unique-index-aware (see Conflict #5)                                                                                                                       |
| Folder exists                  | `MediaFolderRepository.findById()` — a soft-deleted folder id is simply "not found"                                                                                                   |
| Self/circular parent (folders) | `SelfParentFolderException`/`CircularFolderParentException`, same `wouldCreateCycle()` used by Categories                                                                             |

## Search

Database-only (`ILIKE` via Prisma's `contains`/`insensitive`), per instruction — no Elasticsearch/Meilisearch/AI:

- **Media**: `search` (storageKey/altText/caption), `filename` (storageKey basename + `metadata.filename` JSON path), `mimeType`, `extension` (storageKey suffix), `folderId` (`metadata.folderId` JSON path equals), `type`, `status`, `uploadedBy`, `createdFrom`/`createdTo`, plus pagination/sort.
- **Media Folders**: `parentId`, `search` (name), plus pagination/sort.

## Reference Resolution

See "Usage Strategy" above — this is the same mechanism `DELETE /media/:id` and `GET /media/:id/usages` both call, ensuring the delete-time check and the read-time report can never disagree.

## Delete Strategy

Media: reject if already deleted → reject if `computeUsages().length > 0` → soft delete. Folder: reject if already deleted → reject if it contains active assets (via `metadata.folderId` match) → reject if it has active children → soft delete. Both mirror the exact two-guard pattern Categories established in Milestone 9.

## Permission Flow

| Action                                 | Permission                                                                                 | Policy?                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Every Media read                       | `RequireAnyPermission(media.upload, media.delete)`                                         | No                                                                    |
| Media create                           | `media.upload`                                                                             | No (nothing to own yet)                                               |
| Media update/rename/move/copy-metadata | `media.upload`                                                                             | Yes — `MediaOwnershipPolicy` (Owner/Editor/Administrator/Super Admin) |
| Media delete/restore                   | `media.delete`                                                                             | Yes — `MediaOwnershipPolicy`                                          |
| Every Folder endpoint (read + write)   | `media.upload` (writes) / `RequireAnyPermission` (reads) / `media.delete` (delete/restore) | Yes — `TaxonomyPolicy` (reused from Categories)                       |

## API Summary

**Media** (`/media`): `GET /`, `GET /:id`, `GET /:id/usages`, `GET /:id/duplicates`, `POST /`, `PATCH /:id`, `POST /:id/rename`, `POST /:id/move`, `POST /:id/copy-metadata`, `DELETE /:id`, `POST /:id/restore`.

**Media Folders** (`/media-folders`): `GET /`, `GET /tree`, `GET /:id`, `GET /:id/children`, `GET /:id/descendants`, `GET /:id/ancestors`, `GET /:id/breadcrumb`, `POST /`, `PATCH /:id`, `POST /:id/move`, `DELETE /:id`, `POST /:id/restore`.

## Testing

153 new tests across 20 spec files: `MediaValidator` (15), `MediaOwnershipPolicy` (9), `MediaMapper` (7), `MediaFolderMapper` (5), `MediaRepository` (17), `MediaFolderRepository` (11), `MediaService` (22), `MediaFolderService` (18), `MediaController` (11), `MediaFolderController` (10), plus 10 DTO specs (28 tests). Total: **565 tests / 71 suites** passing workspace-wide (up from 412/63 before this milestone). Categories' own 135 tests were re-run and confirmed unaffected by the tree-utility genericization.

## Future Integration

Not requested by this milestone's scope, listed for completeness: a real `folderId` FK column on `MediaAsset` (schema migration, would let folder filtering use a real join instead of a JSON path filter); a content-hash column for exact (not heuristic) duplicate detection; a concrete `StorageProvider`/`CacheProvider` implementation (R2 per the V1 default noted in its own interface doc comment); a `media.view`/`media.restore` permission split, following the same deferred pattern already documented for Settings/Users/Articles/Categories in `43_CONFLICT_RESOLUTION.md`; usage detection extended to `Category`/`Page`/`Menu` once those modules reference media.

## Deferred / Explicitly Out of Scope

Frontend, Admin UI, Public Website, Uploader UI, Image Crop/Resize/Compression/Optimization, CDN, Cloudflare R2/S3/MinIO/Azure Blob/GCS implementations, Video Streaming, Audio Processing, OCR, AI Image Recognition, Background Worker/Queue, Thumbnail Generator, Menu Builder, Page Builder, Widgets, Themes, Dynamic Homepage, Multi-site/Agency/Enterprise/SaaS logic, a `media.view`/`media.restore` permission split, real folder FK, content-hash-based duplicate detection.

## Approved Date

Pending — awaiting explicit approval before Milestone 11, per this milestone's own instruction.

## Architecture Status

**IMPLEMENTED, AWAITING APPROVAL** — Media Library Foundation (Milestone 10).
