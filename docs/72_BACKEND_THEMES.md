# Backend — Themes / Appearance Module

## Architecture

`modules/themes` mirrors `modules/pages`/`modules/menus`'s architecture
(repository / validator / mapper / service / controller, plus a separate
`Public*` controller+service pair for the unauthenticated read path,
exactly like Menus' Backend Milestone 11.3 split). Single permission
(`theme.manage`, class-level guard) — no ownership split, matching Pages/
Menus/Settings (no `authorId` on `Theme`).

**Schema**: no `Theme` model existed before this milestone — only a loose,
unrelated `Site.theme Json?` field (never wired to any module, left
untouched — same situation `Menu.items` was in before its own 11.1
refactor). A new relational `Theme` model + `ThemeStatus` enum were added,
following the exact `Category`/`Menu` conventions: `siteId` scoping,
soft delete, audit fields, application-level slug uniqueness (no DB
constraint, consistent with `Menu.slug`/`Menu.location`).

Multisite-readiness: every query is `siteId`-scoped (`getDefaultSite()` in
V1, same single-site resolution `Articles`/`Categories`/`Pages`/`Menus`
all use) and activation state (`isActive`) is scoped per-site at the
repository level (`activate()`'s `updateMany` only touches rows sharing
the target theme's `siteId`) — a second site's active theme is never
touched by the first site's activation, ready for the day `getDefaultSite()`
is replaced with real per-request site resolution.

## Folder Structure

```
modules/themes/
  themes.module.ts
  controllers/themes.controller.ts (+ .spec.ts)          — admin CRUD, theme.manage-gated
  controllers/public-themes.controller.ts (+ .spec.ts)    — public read, @Public()
  services/themes.service.ts (+ .spec.ts)
  services/public-themes.service.ts (+ .spec.ts)          — isolated read path, cache-ready seam
  repositories/themes.repository.ts (+ .spec.ts)
  mappers/themes.mapper.ts (+ .spec.ts)
  validators/themes.validator.ts (+ .spec.ts)
  interfaces/theme-query.interface.ts
  constants/theme.constants.ts
  exceptions/theme.exceptions.ts
  dto/{create-theme,update-theme,theme-query,theme-response,
       theme-settings,public-theme-response}.dto.ts (+ theme-settings.dto.spec.ts)
```

## API Mapping

| Method | Path                   | Notes                                                           |
| ------ | ---------------------- | --------------------------------------------------------------- |
| GET    | `/themes`              | paginated, filter `status`/`isActive`, search by `name`         |
| GET    | `/themes/active`       | the site's currently active theme (registered before `:id`)     |
| GET    | `/themes/:id`          | full metadata — also serves as "Preview" (no separate endpoint) |
| POST   | `/themes`              | starts DRAFT, inactive                                          |
| PATCH  | `/themes/:id`          | name/slug/version/author/description/thumbnail/status/settings  |
| DELETE | `/themes/:id`          | soft delete                                                     |
| POST   | `/themes/:id/restore`  |                                                                 |
| POST   | `/themes/:id/activate` | deactivates the site's previous active theme automatically      |

All of the above require `theme.manage`. The public route requires nothing:

| Method | Path            | Notes                                   |
| ------ | --------------- | --------------------------------------- |
| GET    | `/public/theme` | active theme's appearance settings only |

**No standalone deactivate endpoint** — the brief's "Deactivate Theme"
feature is satisfied entirely as a side effect of `activate()` (its own
"Only one active theme; activation deactivates the previous one" rule),
not a separate action; adding one would be inventing an endpoint the API
list doesn't include.

## Activation Flow

`ThemesService.activateTheme(id, actor)`:

1. `repository.findById(id, includeDeleted: true)` — deliberately looks
   past soft-deleted rows so a deleted theme gets its own specific
   `ThemeDeletedCannotActivateException`, not a generic `ThemeNotFoundException`
   that would look like a typo'd id.
2. If `deletedAt` is set → reject (`ThemeDeletedCannotActivateException`) — the brief's "Reject activating deleted themes" rule.
3. `repository.activate(id, siteId, actorId)` runs two writes in **one Prisma transaction** (mirroring `MenusRepository.reorderItems`'s atomicity reasoning): `updateMany({siteId, isActive: true, id: {not: id}}, {isActive: false})` then `update(id, {isActive: true})`. The site is never left with zero or two active themes mid-request.

No DB unique constraint enforces "one active theme per site" — the
transaction's deactivate-then-activate sequence guarantees it by
construction, the same reasoning `Menu.location`'s application-level
uniqueness check uses instead of a partial unique index.

## Appearance Settings

`ThemeSettingsDto` (validated, then stored as `Theme.settings` JSON — same
"typed DTO on the wire, JSON column in the DB" pattern `SeoMeta`/
`MenuItem.layoutMeta` already establish): `logo, favicon, primaryColor,
secondaryColor, typography, headerLayout, footerLayout, containerWidth,
borderRadius, buttonStyle, homepageLayout, blogLayout, customCss, customJs`
— every field optional, matching the brief's own example list exactly.
`primaryColor`/`secondaryColor` are hex-shape-validated (`#abc` or
`#aabbcc`) — an input-shape check, not an invented business rule (same
class as `SLUG_SHAPE_PATTERN`). `typography` stays free-form JSON (font
family/sizes/weights) since the brief lists "Typography" as one example,
not a fixed field set.

These are deliberately **not** part of the global `Settings` module
(`settings.category.key` architecture) — per the brief's own instruction,
"theme-scoped settings, not global Settings entries."

## Public API

`GET /public/theme` returns the site's active theme's appearance data
only — `PublicThemeResponseDto`: `id, name, slug, version` (minimal,
non-admin metadata) + `logo, favicon, colors: {primary, secondary},
typography, layout: {header, footer, containerWidth, borderRadius,
buttonStyle, homepage, blog}, customCss, customJs`. Never exposes
`status`/`isActive`/`author`/`description`/`thumbnail`/audit fields/
`siteId` — built explicitly field-by-field in `ThemesMapper.toPublicResponseDto`
(this project's `ResponseInterceptor` forwards whatever plain object a
service returns, so the mapper is the actual security boundary, not the
`@ApiProperty()` list — same reasoning `MenusMapper`'s own public mapper
documents).

`customCss`/`customJs` are included even though not individually named in
the brief's "Returns only" list — they're theme presentation data the
public site needs to actually render, not admin-only information;
omitting them would make those two appearance settings pointless to have
built.

`PublicThemesController`/`PublicThemesService` are separate classes from
the admin pair — same reasoning `PublicMenusController`/`PublicMenusService`
document: `ThemesController` carries a class-level `@RequirePermission`
that `PermissionGuard` reads off the class itself, so a route inside it
can never truly be public regardless of `@Public()`. `PublicThemesService.withCache`
is the same no-op cache-readiness seam `PublicMenusService` introduced in
Backend Milestone 11.4 (recommended future key: `theme:{siteId}:active`) — no cache implemented, only the isolation.

## Known Limitations

1. **No "default theme" fallback** — `THEME DATA` defines `isActive`, not a separate `isDefault` flag. `GET /themes/active` and `GET /public/theme` both honestly 404 (`NoActiveThemeException`) when nothing is active, rather than silently guessing a fallback theme. If the site's active theme is later soft-deleted, the same 404 applies (the standard `deletedAt: null` filter already excludes it from `findActive`) — no automatic re-activation of another theme happens.
2. **No status-transition restriction** — unlike Pages'/Articles' `GENERIC_UPDATE_ALLOWED_STATUSES` split (PUBLISHED reachable only via a dedicated endpoint), `UpdateThemeDto.status` accepts any `ThemeStatus` value directly, since the brief's four RULES don't mention a status-transition restriction for Themes — `isActive` (the one state genuinely gated by `activate()`) is the only field with a dedicated-endpoint-only rule.
3. **Legacy `Site.theme` field untouched** — the pre-existing `Site.theme Json?` column is unrelated to this module and was not migrated/removed (out of scope; not asked for).
4. **No caching implemented** — `PublicThemesService.withCache` is structured to be cache-friendly but no in-memory/HTTP/Redis cache wraps it yet.

## Future Integration

- **Caching**: `PublicThemesService.withCache` is the intended wrap point for a future `CacheInterceptor`/Redis layer, same pattern `PublicMenusService` established.
- **Frontend**: the admin Pages/Menus-milestone pattern extends directly for the eventual admin UI (`ThemeTable`/`ThemeForm`, an Activate action, an Appearance Settings panel backed by `ThemeSettingsDto`'s exact field set) — none of that is built in this pass (backend-only milestone).
- **Public Website**: `GET /public/theme` is the one call the eventual Public Website needs to render logo/favicon/colors/typography/layout/custom CSS &amp; JS — no further backend work implied by that integration beyond what's already shipped here.
