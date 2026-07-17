# 53_API_FREEZE

## Executive Summary

Official API Freeze declaration for Modern CMS V1, effective alongside the V1 Backend Freeze (`52_BACKEND_FREEZE_REPORT.md`). This document is the contract every frontend (`apps/web`, `apps/admin`) and external API consumer can rely on going forward. It does not describe new behavior — it consolidates conventions already established, consistently, across all 9 business modules from Milestone 4 through Milestone 12.

## API Version

`/api/v1/` — versioned via `AppConfigService.app.apiPrefix` (`config/env/*.env`'s `API_PREFIX`), applied globally in `main.ts` (`app.setGlobalPrefix(config.app.apiPrefix)`). No `/api/v2/` exists or is planned within V1's scope.

## Breaking Change Policy

**No breaking change may ship without a new API version.** A breaking change is any of: removing/renaming an endpoint, removing/renaming a request or response field, changing a field's type, changing a success/error status code for an existing scenario, changing the response envelope shape, or changing what a permission gates. Additive changes are NOT breaking and may ship within `v1`: a new endpoint, a new optional request field, a new response field (clients must already ignore unknown fields per standard JSON consumption), a new permission gating a new endpoint.

Every module's own architecture doc (`37`–`51`) documents its permission/DTO/endpoint list as frozen for V1 in this same spirit — this document is the cross-module consolidation of that same rule, not a new one.

## Endpoint Count

**120 operations across 93 unique paths**, live-verified via a full application boot (`NestFactory.create()` + `SwaggerModule.createDocument()`) as of the V1 Backend Freeze:

| Prefix                       | Operations | Module                                          |
| ---------------------------- | ---------- | ----------------------------------------------- |
| `/auth`                      | 8          | Identity                                        |
| `/authorization`             | 1          | Authorization                                   |
| `/settings`                  | 9          | Settings                                        |
| `/users`                     | 21         | Users (includes `UserCommentsController`)       |
| `/articles`                  | 14         | Articles (includes `ArticleCommentsController`) |
| `/categories`                | 14         | Categories                                      |
| `/tags`                      | 7          | Tags                                            |
| `/media`                     | 11         | Media                                           |
| `/media-folders`             | 12         | Media                                           |
| `/comments`                  | 10         | Comments                                        |
| `/seo`                       | 10         | SEO                                             |
| `/health`, `/live`, `/ready` | 1 each     | Health                                          |

## Authentication

Every endpoint requires a valid JWT bearer token by default (`JwtAuthGuard`, global `APP_GUARD`) except the 6 explicitly `@Public()` Identity endpoints (`login`, `refresh`, `forgot-password`, `reset-password`, `verify-email`, `resend-verification`). `Authorization: Bearer <accessToken>` header on every other request. Token payload carries exactly 4 claims (`sub`, `email`, `role: null`, `siteId`) — `role` is reserved for forward compatibility and is **never** read for authorization by any endpoint; every permission/role check queries the database fresh, every request. Access tokens are short-lived (`JWT_ACCESS_EXPIRES_IN`, default 15m); a 401 on an expired token means "call `/auth/refresh`," not "re-authenticate from scratch," unless the refresh token has also expired or been revoked.

## Refresh Flow

```
POST /auth/refresh { refreshToken }
  → old RefreshToken + Session revoked
  → new RefreshToken + Session issued (rotation, not a blacklist)
  → { accessToken, refreshToken, expiresIn }
```

Reuse of an already-rotated refresh token is rejected (401) — this is the sole revocation mechanism; there is no separate blacklist table. Clients must always use the newest `refreshToken` returned; a client holding a stale token after a successful rotation elsewhere will fail and must re-authenticate.

## Authorization

Route-level, opt-in guards (`PermissionGuard`/`RoleGuard`/`AuthorizationGuard`) read `@RequirePermission`/`@RequireAnyPermission`/`@RequireAllPermissions`/`@RequireRole` metadata — never globally applied beyond `JwtAuthGuard`. A 403 response means the authenticated caller lacks the required permission or role; a 401 means no valid token was presented at all. Several modules gate self-service actions (acting on one's own resource — `PATCH /users/me/profile`, creating/editing one's own comment, `POST /users/:id/change-password` when `id` is the caller's own) with authentication only, no additional permission — this is intentional and documented per-module, not a gap.

## Pagination

Every list endpoint returning more than one item uses the shared envelope:

```json
{
  "success": true,
  "data": [/* items */],
  "meta": {
    "pagination": { "page": 1, "limit": 20, "total": 137, "hasNext": true, "hasPrevious": false }
  }
}
```

Request-side: `?page=1&limit=20` (both optional, default `1`/`20`, `limit` capped per-module via `PaginationQueryDto`). Non-paginated "get everything" endpoints (`GET /categories/tree`, `GET /categories/flat`, `GET /media-folders/tree`, `GET /articles/:id/comments/tree`) are a deliberate, documented exception — each returns a bounded, small hierarchy or thread, not a page-able list, and is named as such in its own module's architecture doc.

## Sorting

`?sortBy=<field>&sortOrder=asc|desc`, both optional. Every module defines its own closed `SortField` enum (`ArticleSortField`, `CategorySortField`, `MediaSortField`, `CommentSortField`, `UserSortField` — SEO has no list endpoint, so no `SortField`) — an invalid `sortBy` value is rejected by DTO validation (400), never silently ignored or defaulted past validation.

## Filtering

Every list endpoint's query DTO defines its own closed filter set (documented per-module in `docs/46`–`51`) — free-text `search` filters use database `ILIKE`/`contains` matching only (no Elasticsearch/Meilisearch/AI anywhere in V1). Filters not recognized by a module's `*QueryDto` are rejected by the global `ValidationPipe`'s `whitelist: true, forbidNonWhitelisted: true` config, not silently dropped.

## Response Envelope

Every response, success or error, is wrapped identically (`core/responses/api-response.ts`, `ResponseInterceptor` + `GlobalExceptionFilter`):

```json
{
  "success": true,
  "message": "...",
  "data": {},
  "meta": { "requestId": "...", "timestamp": "..." },
  "errors": []
}
```

`data` is `null`/omitted-equivalent for void actions, a single object for single-resource responses, an array for `isArray`-marked list responses (with `meta.pagination` populated as above). No endpoint in the 120-operation surface returns a bare, unwrapped JSON body.

## Error Format

```json
{
  "success": false,
  "message": "...",
  "data": null,
  "meta": { "requestId": "...", "timestamp": "..." },
  "errors": [{ "code": "BUSINESS_NOT_FOUND", "message": "...", "details": null }]
}
```

Every thrown exception across all 9 business modules extends `BusinessException` (with a `BusinessErrorCode`) or is an `HttpException` carrying a `ValidationErrorCode` — no module hand-rolls its own error shape (confirmed by the Final Backend Architecture Audit's API-consistency check). `details` is populated only outside production (`NODE_ENV !== 'production'`); production error responses never leak stack traces or internal detail. Authentication failures are deliberately generic (never reveal whether an email exists) per `37_IDENTITY_FREEZE.md`'s Security Notes.

## DTO Policy

Every module follows the `CreateXDto`/`UpdateXDto`/`XResponseDto`/`XQueryDto` naming convention (Settings is a documented, intentional exception — no `SettingQueryDto` exists since its vocabulary is closed-registry, not user-defined). Every request DTO field carries an explicit `class-validator` decorator; the global `ValidationPipe` (`whitelist: true, forbidNonWhitelisted: true, transform: true`) rejects unknown/extraneous fields at the HTTP boundary, preventing mass-assignment of fields like `id`/`createdAt`/`deletedAt` from a client payload. No DTO in the frozen surface accepts an un-decorated field except where explicitly documented (`UpdateSettingDto.value: unknown`, whose real type check happens against `SettingDefinition.type` in `SettingsValidator`, not statically on the DTO — a setting's value can legitimately be a string, number, boolean, object, array, or null depending on which setting is being written).

## Future API Rules

- A `v2` prefix is required for any breaking change; `v1` remains stable and supported for the lifetime of any `v2` migration window.
- New permission keys (the deferred `*.view`/`*.create`/`*.update`/`*.delete`/`*.publish` splits for Settings/Users/SEO — `43_CONFLICT_RESOLUTION.md`) may be added additively without a version bump, since they only ever narrow or clarify access on existing endpoints, never remove capability from an existing role.
- A future Pages/Search/Ads/Analytics/Notifications/Scheduler/AI module adds new route prefixes, never modifies an existing one.
- Sitemap generation (XML/News/Image/Video/Index/Auto-Submit — `51_SEO_ARCHITECTURE.md` "Sitemap Future"), when built, is additive under a new prefix (e.g. `/sitemaps`), not a modification of `/seo`.

## Approved Date

Pending — part of the same freeze patch as `52_BACKEND_FREEZE_REPORT.md`, `54_RELEASE_NOTES_V1.md`, `55_FRONTEND_HANDOFF.md`.

## Architecture Status

**API FREEZE — AWAITING APPROVAL.**
