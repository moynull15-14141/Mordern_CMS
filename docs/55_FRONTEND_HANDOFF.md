# 55_FRONTEND_HANDOFF

## Executive Summary

Practical integration guide for `apps/web`/`apps/admin` (or any external consumer) against the frozen V1 backend API (`53_API_FREEZE.md`). This document translates that frozen contract into "how do I actually call this" terms — it does not redefine anything `53` already froze.

## Authentication Flow

```
POST /api/v1/auth/login { email, password, rememberMe? }
  → 200 { accessToken, refreshToken, expiresIn }
  → store both tokens; attach accessToken as `Authorization: Bearer <token>` on every subsequent request
GET /api/v1/auth/me (requires a valid access token)
  → returns the current user's identity fields
POST /api/v1/auth/logout (requires a valid access token)
  → revokes the current session/refresh token
```

Login failures are deliberately generic (`401`, "Invalid email or password") — never reveal whether the email exists. Do not build a UI that infers account existence from the error message.

## Refresh Flow

```
POST /api/v1/auth/refresh { refreshToken }
  → 200 { accessToken, refreshToken, expiresIn }  — BOTH tokens are new; discard the old pair entirely
  → 401 if the refreshToken was already used once (rotation-based reuse detection) — force a full re-login
```

Recommended client pattern: on any `401` from a non-auth endpoint, attempt one `POST /auth/refresh` using the stored refresh token, retry the original request once with the new access token, and only force a full re-login if the refresh itself fails.

## Permission Flow

`GET /api/v1/authorization/me` (requires a valid access token) returns `{ roles: string[], permissions: string[] }` for the current user — call this once after login to drive UI-level show/hide logic (e.g. hiding a "Delete" button a Contributor doesn't have `article.delete` for). **This is a UX convenience only — the backend independently re-checks every permission on every request; never trust client-side hiding as the actual access control.** A `403` response means the action is genuinely forbidden regardless of what the UI showed.

Ownership-gated actions (editing your own article/comment/media, but not someone else's, unless you hold a broad role like Administrator) return `403` with no special error code distinguishing "wrong permission" from "not the owner" — treat both identically in the UI ("You don't have permission to do this").

## API Consumption Rules

- Always send `Content-Type: application/json`.
- Always read `success` before touching `data` — a `false` response still returns HTTP 2xx in some client libraries' eyes if you only check status code carelessly; check the envelope's `success` field, not just the HTTP status, though the two are kept consistent (2xx ⇒ `success: true`, 4xx/5xx ⇒ `success: false`).
- Never construct a URL by hand-concatenating an unvalidated `id` — every `:id`/`:slug` path param is a plain string; the backend validates format server-side (a malformed UUID returns a clean 400, not a crash).
- Respect `whitelist`-style request bodies — do not send extra fields "just in case"; the backend's global `ValidationPipe` rejects unknown fields with a 400, so a client sending stray fields (e.g. `id`, `createdAt`) on a create/update payload will fail, not silently ignore them.

## Response Format

```json
{
  "success": true,
  "message": "...",
  "data": {/* or [] or null */},
  "meta": { "requestId": "...", "timestamp": "..." },
  "errors": []
}
```

Log `meta.requestId` alongside any client-side error report — it's the same id `GlobalExceptionFilter` and `LoggingInterceptor` attach server-side, making cross-referencing a support ticket to server logs possible.

## Pagination

```
GET /api/v1/articles?page=2&limit=20
→ data: [...], meta.pagination: { page: 2, limit: 20, total: 137, hasNext: true, hasPrevious: true }
```

Build pagination controls off `meta.pagination`, never by counting `data.length` (a last page legitimately has fewer than `limit` items). `hasNext`/`hasPrevious` are pre-computed server-side — use them directly rather than re-deriving from `page`/`limit`/`total`.

## Sorting

`?sortBy=<field>&sortOrder=asc|desc` — the valid `sortBy` values are a closed, per-resource enum (e.g. Articles: `title`/`createdAt`/`updatedAt`/`publishedAt`/`status`). Sending an unlisted value returns a 400, not a silently-ignored sort. Check each module's Swagger schema (`GET /docs-json` in a running instance, or `53_API_FREEZE.md`) for the exact enum per resource before building a sort-column picker.

## Filtering

Every list endpoint's filters are documented in its own DTO's Swagger schema — free-text `search` params do substring matching only (no fuzzy/AI search in V1), so don't build a UI that implies smarter search than that. Date-range filters (`createdFrom`/`createdTo`, etc.) expect ISO 8601 date-time strings.

## Media Usage

Media is **metadata-registration only** — there is no upload endpoint that accepts file bytes. `POST /media` expects the caller to already know a `storageKey` (the object's eventual location) and registers a database row describing it; actually placing bytes at that key is out of scope for V1's backend (no `StorageProvider` implementation exists). **Do not build a file-picker-to-`POST /media` flow expecting the backend to store the file** — this integration point does not exist yet. `GET /media/:id/usages` and `GET /media/:id/duplicates` are read-only helper endpoints for an admin media-library UI.

## SEO Usage

`POST /seo/preview` and `POST /seo/validate` accept a candidate set of SEO fields (title/description/keywords/canonicalUrl/openGraph/twitterCard/robots/schemaJson) and return, respectively, a computed preview object or a combined `{ valid, errors, analysis: { warnings } }` result — **neither persists anything**, both are safe to call on every keystroke of an SEO-editing form (debounce recommended, not required for correctness). Actual persistence of an article/category's SEO fields happens through that entity's own `PATCH /articles/:id`/`PATCH /categories/:id` (nested `seo` object), **not** through `POST /seo` — the standalone `/seo` CRUD is a separate, `seo.manage`-gated administrative surface over raw `SeoMeta` rows, not the primary editorial path. `schemaJsonPretty` in any SEO response is a pretty-printed **string** for display in an editor pane — it is not markup and must not be injected into a page as-is; wrap it in your own `<script type="application/ld+json">` tag if/when you render it.

## Comments Usage

Any authenticated user can `POST /comments` (own comment, `status: PENDING` by default) — no special permission is required, matching a typical "logged-in readers can comment" product expectation. Non-moderators only ever see `APPROVED` comments in any list endpoint, regardless of what status filter they request — build the moderation queue UI (`PENDING`/`REJECTED`/`SPAM` visibility) only for users known to hold `comment.moderate` (check `GET /authorization/me`'s `permissions` array first, though the backend enforces this regardless). `GET /articles/:id/comments/tree` returns the full nested reply tree for one article, unpaginated — suitable for a typical article's comment section; do not call it in a loop for a bulk admin view (use `GET /comments?articleId=...` instead, which is paginated).

## Error Handling

Map `errors[].code` (not `message`, which is for humans) to your own UI logic if you need programmatic branching — codes are stable, namespaced strings (`BUSINESS_NOT_FOUND`, `BUSINESS_CONFLICT`, `BUSINESS_RULE_VIOLATION`, `VALIDATION_INVALID_INPUT`, `VALIDATION_MISSING_FIELD`, plus authentication/authorization/infrastructure/system categories — see `core/exceptions/codes/*.ts`). `message` text may be improved/reworded in a future non-breaking release; `code` values will not change without a version bump per `53_API_FREEZE.md`'s Breaking Change Policy.

## Integration Checklist

- [ ] Store `accessToken`/`refreshToken` securely (never in `localStorage` for a production app handling sensitive content — prefer an httpOnly-cookie proxy layer or in-memory + refresh-on-load, per your own security review; this backend itself is a pure bearer-token API with no cookie support built in).
- [ ] Implement the refresh-on-401-retry-once pattern described above.
- [ ] Call `GET /authorization/me` once after login and cache the permission list for UI-level gating (re-fetch on any role/permission change your app can detect, e.g. after an admin edits the user's roles).
- [ ] Never rely on client-side permission checks as actual security — always handle a `403` gracefully even if the UI "shouldn't" have shown the action.
- [ ] Build pagination/sorting/filtering controls against each resource's documented enum/DTO shape, not assumptions carried over from another resource.
- [ ] Do not build a Media upload flow expecting server-side file storage — confirm with the backend team before assuming this exists.
- [ ] Treat `POST /seo/preview`/`POST /seo/validate` as pure, non-persisting helpers; persist SEO changes through the owning entity's own update endpoint.
- [ ] Surface `meta.requestId` in any client-side error logging/reporting.

## Approved Date

Pending — part of the same freeze patch as `52_BACKEND_FREEZE_REPORT.md`, `53_API_FREEZE.md`, `54_RELEASE_NOTES_V1.md`.

## Architecture Status

**FRONTEND HANDOFF — AWAITING APPROVAL.**
