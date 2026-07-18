# Frontend Comments

## Architecture
- `features/comments` owns the admin comments list and detail views.
- The module mirrors the backend contract directly: types, API wrapper, query keys, hooks, and page compositions.
- Shared UI primitives are reused for tables, dialogs, badges, errors, and empty/loading states.

## API Mapping
- `GET /comments`
- `GET /comments/:id`
- `GET /comments/:id/replies`
- `POST /comments`
- `PATCH /comments/:id`
- `DELETE /comments/:id`
- `POST /comments/:id/restore`
- `POST /comments/:id/approve`
- `POST /comments/:id/reject`
- `POST /comments/:id/spam`
- `GET /articles/:articleId/comments`
- `GET /articles/:articleId/comments/tree`
- `GET /users/:userId/comments`

## Implemented Features
- Server-side list pagination, search, sorting, and filters for status, article id, and author id.
- Comment detail view with parent comment, reply list, related article lookup, and author lookup when the backend permissions allow it.
- Moderation actions for approve, reject, spam, delete, and restore.
- Edit and reply dialogs backed by the real DTO fields.

## Backend Limitations
- There is no separate comment-view permission; the list/detail pages stay available to authenticated users.
- Article and user enrichment are permission-gated by their own backend endpoints, so the detail page falls back to ids or comment snapshots when those lookups are not allowed.
- Filters use backend-supported ids only; no invented relation picker exists.

## Future Integration
- Add nicer article/author lookup widgets if the backend later exposes searchable selectors.
- Add deeper reply tree navigation if the admin needs threaded moderation beyond direct replies.
