# 75_BACKEND_PUBLIC_CONTENT_API.md

# Backend Public Content API (Backend Milestone 13.2)

- **Scope:** New `@Public()` read-only endpoints for Pages, Articles, Categories, Settings, Site, and SEO — the real backend surface `docs/74_PUBLIC_RENDERING_FOUNDATION.md` ("Known Limitations") flagged as missing. No new business logic: every endpoint delegates to the existing, already-tested admin service for its module.
- **Status:** Awaiting Review
- **Related:** `74_PUBLIC_RENDERING_FOUNDATION.md` (the frontend consumer this unblocks), `69_BACKEND_PAGES.md`, `46_ARTICLES_ARCHITECTURE.md`, `47_CATEGORY_TAG_ARCHITECTURE.md`, `39_SETTINGS_ARCHITECTURE.md`, `51_SEO_ARCHITECTURE.md`, `71_BACKEND_MENUS.md`/`72_BACKEND_THEMES.md` (the precedent this milestone follows exactly).

---

## 1. Architecture

Every new controller in this milestone follows one rule, established by the already-existing `PublicMenusController`/`PublicThemesController` (Backend Milestones 11.3/12): **a separate `@Public()` controller, never `@Public()` routes bolted onto the admin controller.** The admin controller (`PagesController`, `ArticlesController`, `CategoriesController`, `SettingsController`, `SeoController`) carries a class-level `@UseGuards(PermissionGuard)`, and `PermissionGuard` reads `@RequirePermission` metadata off both the handler _and_ the class — so a route inside it can never truly be public. Isolating the public path also gives a future caching layer one narrow class to wrap per module without touching admin CRUD.

Every `Public*Service` is a thin wrapper, never a reimplementation:

```
PublicXController → PublicXService → XService (existing, unchanged) → XRepository (existing, unchanged)
                                    ↘ PublicXMapper (new, trims the response)
```

No repository gained a new method in this milestone except `SiteRepository` (a brand-new module — see §9). Every Pages/Articles/Categories/Settings/SEO query already existed; only the gate ("is this actually published/active/public?") and the DTO trim are new.

---

## 2. Controllers

| Controller                   | Route prefix         | Module                                                 |
| ---------------------------- | -------------------- | ------------------------------------------------------ |
| `PublicPagesController`      | `/public/pages`      | `modules/pages` (existing module, new controller)      |
| `PublicArticlesController`   | `/public/articles`   | `modules/articles` (existing module, new controller)   |
| `PublicCategoriesController` | `/public/categories` | `modules/categories` (existing module, new controller) |
| `PublicSettingsController`   | `/public/settings`   | `modules/settings` (existing module, new controller)   |
| `PublicSiteController`       | `/public/site`       | `modules/site` (**new module** — see §9)               |
| `PublicSeoController`        | `/public/seo`        | `modules/seo` (existing module, new controller)        |

---

## 3. API Mapping

| Method | Path                            | Delegates to                                                                                                            | Gate applied                                                                    |
| ------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| GET    | `/public/pages/slug/:slug`      | `PagesService.getPageBySlug()`                                                                                          | `status === PUBLISHED`                                                          |
| GET    | `/public/articles`              | `ArticlesService.listArticles()`                                                                                        | `status === PUBLISHED`, `visibility === PUBLIC` (forced, not caller-controlled) |
| GET    | `/public/articles/slug/:slug`   | `ArticlesService.getArticleBySlug()`                                                                                    | `status === PUBLISHED`, `visibility !== PRIVATE` (PUBLIC or UNLISTED — see §5)  |
| GET    | `/public/categories`            | `CategoriesService.listCategories()`                                                                                    | `status === ACTIVE` (forced)                                                    |
| GET    | `/public/categories/slug/:slug` | `CategoriesService.getCategoryBySlug()`                                                                                 | `status === ACTIVE`                                                             |
| GET    | `/public/settings`              | `SettingsService.getByKey()` (per allowlisted key)                                                                      | key ∈ `PUBLIC_SETTING_KEYS` **and** `isSettingSafeToExpose(definition)`         |
| GET    | `/public/site`                  | new `SiteRepository.getDefaultSite()` + `PublicThemesService.getActiveTheme()`                                          | n/a (no draft concept for Site)                                                 |
| GET    | `/public/seo/:entity/:slug`     | `Public{Pages,Articles,Categories}Service.resolvePublishedIdBySlug()` → `SeoService.getSeoFor{Page,Article,Category}()` | same gate as the matching entity's own endpoint                                 |

`GET /public/pages` (a list) was **not** requested by the milestone brief and was not built — only `GET /public/pages/slug/:slug`.

---

## 4. Security Model

- Every route is `@Public()` — bypasses the global `JwtAuthGuard`, no Bearer token needed or accepted.
- Every route is **read-only** — no `Public*Controller` has a `POST`/`PATCH`/`DELETE` handler.
- **Published/active only, everywhere.** No endpoint can return DRAFT, REVIEW, SCHEDULED, or ARCHIVED content. Each `Public*Service` calls the existing admin service (which has no status filter built into its slug lookup) and then gates the result itself: a non-matching status is treated as `XNotFoundException` — the exact same 404 the admin service throws for "doesn't exist at all." **A public caller can never distinguish "this slug doesn't exist" from "this slug exists but isn't published yet."**
- **Soft-deleted content is never reachable** — every underlying admin query already filters `deletedAt: null` unconditionally; the public layer adds nothing here because there is nothing left to add.
- **Article visibility** (not explicitly specified by the milestone brief — decided here): `listArticles` only returns `visibility: PUBLIC`. `getArticleBySlug` additionally allows `UNLISTED` (reachable by direct link, by definition, but never in a listing) but never `PRIVATE`.
- **Settings** are an explicit closed allowlist (`PUBLIC_SETTING_KEYS`), re-validated per key against the setting's own live `SettingDefinition` metadata (`isHidden`/`isEncrypted`/sensitive `type`) before inclusion — see §6.
- **No internal ids leak.** Every Public DTO drops `id` and every foreign-key id (`authorId`, `primaryCategoryId`, `parentId`, `featuredMediaId`, etc.) — see §6 for the full per-field list.
- **No audit trail leaks.** `createdAt`/`updatedAt`/`deletedAt`/`createdBy`/`updatedBy`/`deletedBy` never appear on any Public DTO.
- **No permission/role/internal metadata leaks.** No `Public*Controller` reads or returns anything from the `authorization` module.

---

## 5. Public DTO Rules

Every response DTO in this milestone is a **new class**, never the admin DTO reused or `extend`ed for a wider shape (`PageResponseDto`, `ArticleResponseDto`, `CategoryResponseDto`, `SettingResponseDto`, `SeoResponseDto` are never returned directly). Rules applied uniformly:

- **No `id`.** A public consumer addresses content by `slug`, never by internal UUID. (Exception: `PublicSiteActiveThemeDto.id` — already public via the pre-existing `GET /public/theme`, included here only as a cross-reference key, not a new exposure.)
- **No foreign-key ids** — `author`/`category`/`tags` are trimmed to `{ name, slug }` (or `{ penName }` for author), never `{ id, ... }`.
- **No audit fields** on any Public DTO.
- **No `status`/`visibility`** on the response — both are fixed to an allowed value by construction, so echoing them back is redundant, not rendering data.
- **SEO sub-objects exclude `extraMeta`** — an open, loosely-typed escape hatch with no guaranteed public-safe contents (same reasoning across Pages/Articles/Categories/the dedicated SEO endpoint).
- **Article list vs. detail** — the list endpoint's `PublicArticleListItemDto` omits `body` (heavy) and `seo` (not rendered in a listing); only `PublicArticleResponseDto` (the by-slug detail) includes them.
- **`body` is opaque everywhere it appears** (`Page.body`, `Article.body`) — still a raw JSON value on the wire, never parsed or restructured. Turning it into HTML is Block/Rich-Content Engine work, out of scope for this milestone (same boundary `74_PUBLIC_RENDERING_FOUNDATION.md` documents on the frontend side).

---

## 6. Caching Strategy

No Redis, no new cache implementation — per the milestone brief ("Do not implement Redis"). Every `Public*Service` is written so a cache CAN be added later with zero call-site changes, mirroring the exact "cache-readiness seam" pattern `PublicMenusService`/`PublicThemesService` already established (a `withCache(key, resolver)` passthrough method, today just calling `resolver()` directly). This milestone does not add that seam to the new services — it's a direct, uncached call to the underlying admin service — but the same shape is trivial to retrofit:

| Service                                     | Recommended future cache key                                       |
| ------------------------------------------- | ------------------------------------------------------------------ |
| `PublicPagesService.getPageBySlug`          | `page:{siteId}:{slug}`                                             |
| `PublicArticlesService.getArticleBySlug`    | `article:{siteId}:{slug}`                                          |
| `PublicArticlesService.listArticles`        | `articles:{siteId}:{page}:{limit}:{sortBy}:{sortOrder}:{search}`   |
| `PublicCategoriesService.getCategoryBySlug` | `category:{siteId}:{slug}`                                         |
| `PublicCategoriesService.listCategories`    | `categories:{siteId}:{page}:{limit}:{sortBy}:{sortOrder}:{search}` |
| `PublicSettingsService.getPublicSettings`   | `public-settings:{siteId}`                                         |
| `PublicSiteService.getSite`                 | `site:{siteId}:public`                                             |
| `PublicSeoService.getSeoForEntity`          | `seo:{entity}:{siteId}:{slug}`                                     |

Invalidation would follow the same rule `PublicMenusService`'s doc comment already states: any admin write scoped to that entity should invalidate its own key — a future cache implementation's job, not this milestone's.

---

## 7. Future Integration

- **Article category/tag filtering on `GET /public/articles`** — not built this milestone (the brief asked only for "server pagination, published only"). Adding `?categorySlug=` would compose `PublicArticlesService` with `PublicCategoriesService.resolvePublishedIdBySlug()` (same reuse pattern the SEO endpoint already demonstrates) — no new repository query needed.
- **Public category tree/hierarchy** — `PublicCategoryResponseDto` deliberately omits `parentId` this milestone (see §5); a public breadcrumb/nested-nav feature would need a slug-based parent/children shape, not the raw id `CategoriesService` already returns.
- **Redis caching** — see §6's key table.
- **`GET /public/pages` (list)** — not requested, not built.

---

## 8. Known Limitations

- **`PublicSiteController` has no admin counterpart to mirror.** Every other `Public*Controller` in this codebase (Menus, Themes, and now Pages/Articles/Categories/Settings/Seo) sits alongside an existing, permission-gated admin controller for the same resource. No `SitesController`/`SitesService`/admin Site CRUD exists anywhere in this backend — `Site` has only ever been read internally via each module's private `getDefaultSite()` copy. `PublicSiteController` is therefore the _first_ Site-facing endpoint in the system, `@Public()` from the start, with a brand-new `SiteRepository` (one more copy of the same `getDefaultSite()` convention `PagesRepository`/`ArticlesRepository`/`CategoriesRepository`/`MenusRepository` already carry — not a new pattern).
- **`Site.theme` and `Site.seoDefaults` are excluded from `PublicSiteResponseDto`.** `Site.theme` is documented in the Prisma schema itself as "a loose blob never wired to any module." `Site.seoDefaults` has zero readers anywhere in the backend (verified by grep) — functionally the same situation, just undocumented as such until now.
- **The milestone brief's Settings examples don't all correspond to real settings.** `logo`/`favicon` live on `Theme` (already public via the pre-existing `GET /public/theme`) — there is no `Setting` definition for either, and inventing one would create two conflicting sources of truth for the same data. "Social links" has no backing field anywhere in the schema or the `SETTING_DEFINITIONS` registry. `analytics.trackingId` exists but its own definition marks it `isHidden: true`; it is excluded on that basis rather than force-included because the brief's example list happened to mention "analytics ids." "Contact information" is represented only by `general.adminEmail` — no phone/address/social-contact setting exists. All of this is enforced by `PUBLIC_SETTING_KEYS` being a closed, explicit allowlist rather than a computed "expose everything not obviously secret" rule.
- **Article visibility gating (`PUBLIC` vs. `UNLISTED` vs. `PRIVATE`) was a judgment call**, not explicit in the milestone brief — see §4's reasoning. Revisit if product intent differs.
- **No `GET /public/pages` list endpoint** — only the by-slug lookup was requested.
- **No pagination/rate-limiting tuned specifically for public traffic** — the existing global `ThrottlerGuard` (already registered in `AppModule`) applies to these routes exactly as it does to every other route; no public-specific throttle tier was added.

---

## Cross References

- `74_PUBLIC_RENDERING_FOUNDATION.md` — the frontend `features/public/services/content-loader.service.ts`/`site.service.ts`/`settings.service.ts` stubs this milestone's endpoints are meant to unblock (wiring them up is a frontend follow-up, not part of this backend milestone).
- `53_API_FREEZE.md` — the response envelope every endpoint here still returns unchanged (`success`/`message`/`data`/`meta`/`errors`).
- `71_BACKEND_MENUS.md` / `72_BACKEND_THEMES.md` — the `Public*Controller`/`Public*Service` separation pattern this entire milestone follows.
- `39_SETTINGS_ARCHITECTURE.md` — the priority-chain resolution (`Runtime Override -> Environment Variable -> Database Setting -> System Default`) `PublicSettingsService` reuses verbatim via `SettingsService.getByKey()`.
- `51_SEO_ARCHITECTURE.md` — `getSeoForPage`/`getSeoForArticle`/`getSeoForCategory`, all pre-existing and reused verbatim by `PublicSeoService`.
