# 67_FRONTEND_MEDIA

Media Library Module (Frontend Milestone 7). Implements the admin Media Library against the real `MediaController`/`MediaFolderController` (`apps/backend/src/modules/media/controllers/`).

**Status: Implemented, awaiting approval.**

## Central Conflict: No Upload Engine

The backend has **no file-transfer capability of any kind**. `POST /media`'s own doc-comment: *"Registers a MediaAsset row — metadata only. No file bytes are accepted or transferred anywhere ('NO upload engine' per instruction)."* There is likewise no download/streaming endpoint, and `MediaResponseDto` has no URL field (only an internal `storageKey`). This reshapes most of the brief's "Upload"/"Preview" sections into their only honest real form:

- **Upload = metadata registration**, not a file transfer. Picking a file (drag & drop or click) never sends bytes anywhere — it only extracts real metadata client-side (filename, MIME type, size; width/height for images via `Image`; duration for video/audio via a hidden `<video>`/`<audio>` element) to pre-fill a `POST /media` call. The one field with no local source, `storageKey`, must be typed in manually — it's the path where the file is assumed to already exist.
- **No "upload progress" percentage** — nothing to measure, since no bytes transfer. Each queued file instead shows its real lifecycle status (pending → submitting → success/error/canceled). "Cancel" is real (`AbortController` + Axios `signal`, aborting the in-flight `POST /media` request itself, not a byte stream). "Retry" re-submits.
- **No Preview, no Download** — both are explicitly "otherwise show download" in the brief, but there is nothing to download either. The Detail page says so directly instead of a broken link. `MediaThumbnail` is an icon-only placeholder by type everywhere (List, Grid, Picker, Upload queue) — same limitation already documented for `UserAvatar` (Frontend Milestone 3) and the Articles featured-image picker (Frontend Milestone 5). The one real, honest preview in the whole feature is a local `URL.createObjectURL` shown only for a not-yet-registered image in the Upload queue — it exists purely client-side and is never sent anywhere.
- **Copy URL is not offered** — no URL field exists. Copy Filename/Copy ID are real.

## Architecture

`features/media/` follows the established shape, reusing `DataTable`, `Drawer` (the reusable `MediaPickerDialog`, its first real use in the app), `Dialog`, `Form`/`FormControl`, `ConfirmDialog`, `PermissionRoute`/`PermissionGate`, `EmptyState`/`ErrorState`/`Skeleton`, `SearchInput`, `DataTablePagination`, `Tabs`. No backend or shared-component change.

**Replaces Frontend Milestone 5's placeholder picker**: `features/articles/components/media-picker-dialog.tsx`, `features/articles/services/media.api.ts`, and `features/articles/hooks/use-media-options.ts` are deleted; `FeaturedImageField` now reuses `MediaPickerDialog` from `features/media` (via `typeFilter="IMAGE"`) and shows the picked asset's real filename instead of a raw id.

`API_ENDPOINTS.MEDIA`/`MEDIA_FOLDERS` (bare strings since Frontend Milestone 1) restructured into path-builder objects. `MEDIA_ROUTES` added — no `/media/[id]/edit` route (this milestone's brief lists only `/media`, `/media/upload`, `/media/[id]`; metadata editing happens inline on Detail).

## API Mapping

| Function | Method + Path |
|---|---|
| `mediaApi.list` | `GET /media` (paginated) |
| `mediaApi.get` | `GET /media/:id` |
| `mediaApi.getUsages` | `GET /media/:id/usages` |
| `mediaApi.getDuplicates` | `GET /media/:id/duplicates` |
| `mediaApi.create` | `POST /media` (metadata registration) |
| `mediaApi.update` | `PATCH /media/:id` (altText/caption/credit/status) |
| `mediaApi.rename` | `POST /media/:id/rename` |
| `mediaApi.move` | `POST /media/:id/move` |
| `mediaApi.copyMetadata` | `POST /media/:id/copy-metadata` (service function exists; not yet wired to a UI control) |
| `mediaApi.remove` | `DELETE /media/:id` |
| `mediaApi.restore` | `POST /media/:id/restore` |
| `mediaFoldersApi.getTree` | `GET /media-folders/tree` |

No bulk endpoint exists. Both controllers are gated by `RequireAnyPermission(media.upload, media.delete)` for reads; writes use `media.upload`/`media.delete` individually — no `media.view`/`media.restore` permission exists (restore reuses `media.delete`).

## Features Completed

- **List** (`/media`): Grid (default) and List views, both server-paginated/searched/filtered (`type`, `folder`, `status`, `uploadedBy`); List additionally server-sorted. Folder options from `GET /media-folders/tree` (flattened).
- **Upload** (`/media/upload`): drag & drop + click multi-file selection, real client-side metadata extraction, per-item editable Storage key/alt text/credit/folder, per-item Retry/Cancel/Remove, bulk "Register N files".
- **Detail** (`/media/[id]`): every `MediaResponseDto` field, usage info (`GET /:id/usages`), possible duplicates (`GET /:id/duplicates`), Edit metadata / Rename / Move-to-folder / Delete / Restore dialogs, Copy filename/id.
- **MediaPicker**: reusable `MediaPickerDialog` (search, type filter, pagination), reused inside Articles' featured-image field, replacing the Frontend Milestone 5 placeholder.
- Permission-gated throughout with only the two real `media.upload`/`media.delete` keys.

## Tests

134 new tests across 30 new test files (features/media) + 4 Articles test files updated for the picker swap. `vitest run` full-suite count restated in the Final Report.

## Known Limitations

- No file preview, thumbnail, or download anywhere — no URL field, no file-serving endpoint exists on the backend.
- Upload is metadata registration only; `storageKey` must be entered manually (no upload engine to derive it from an actual transfer).
- No real "upload progress" percentage — per-item status (pending/submitting/success/error/canceled) is the honest substitute.
- No full Folder CRUD UI (create/rename/move/delete folders) — only `GET /media-folders/tree` is used, for the List filter and Upload/Move folder selectors. Full folder management is real on the backend but outside this milestone's requested pages.
- `copyMetadata` (`POST /media/:id/copy-metadata`) is implemented in the service layer but has no UI control yet (same "service exists, not every endpoint has UI" precedent as Articles' `compareRevisions`/`restoreRevision` in Frontend Milestone 5).
- "Uploaded by" filter is a plain user-id text input, not a picker — no Users-list reuse, keeping the feature self-contained (same choice Articles made for its Author filter).

## Future Integration

If a real `StorageProvider`/upload engine and a URL/download endpoint are ever added to the backend, `MediaThumbnail` gains real previews, `CopyActions` gains "Copy URL", and the Upload flow's manual `storageKey` field becomes optional (auto-populated by whatever the transfer step returns) — no other structural change is anticipated. A future Folder-management milestone can build full CRUD directly on top of the already-real `MediaFolderController` without touching this milestone's List/Upload/Detail pages.
