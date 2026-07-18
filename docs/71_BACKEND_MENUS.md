# Backend — Menus Module

## Architecture

`modules/menus` mirrors `modules/pages`'s architecture (repository /
validator / mapper / service / controller), built against the relational
`Menu` + `MenuItem` schema introduced in Backend Milestone 11.1 (replacing
the original JSON-blob `Menu.items` field). Tree/circular-reference logic
mirrors `CategoriesService.moveCategory`'s three-step guard (self-parent →
parent-exists → `wouldCreateCycle`), applied to `MenuItem`'s adjacency
list instead of `Category`'s.

Single permission (`menu.manage`, class-level guard) — no ownership split,
matching Pages/Settings (neither `Menu` nor `MenuItem` has an `authorId`).

## Folder Structure

```
modules/menus/
  menus.module.ts
  controllers/menus.controller.ts (+ .spec.ts)          — admin CRUD, menu.manage-gated
  controllers/public-menus.controller.ts (+ .spec.ts)    — public read, @Public()
  services/menus.service.ts (+ .spec.ts)
  services/public-menus.service.ts (+ .spec.ts)          — isolated read path
  repositories/menus.repository.ts (+ .spec.ts)
  mappers/menus.mapper.ts (+ .spec.ts)
  validators/menus.validator.ts (+ .spec.ts)
  utils/menu-item-tree.util.ts (+ .spec.ts)
  interfaces/menu-query.interface.ts
  constants/menu.constants.ts
  exceptions/menu.exceptions.ts
  dto/{create-menu,update-menu,menu-query,menu-response,
       create-menu-item,update-menu-item,reorder-menu-items,
       menu-item-response,public-menu-response,
       public-menu-item-response}.dto.ts
```

## API Mapping

| Method | Path                       | Notes                                                                            |
| ------ | -------------------------- | -------------------------------------------------------------------------------- |
| GET    | `/menus`                   | paginated, filter `status`/`location`, search by `name`                          |
| GET    | `/menus/slug/:slug`        |                                                                                  |
| GET    | `/menus/:id`               | returns the nested item tree                                                     |
| POST   | `/menus`                   | no inline items — status starts DRAFT                                            |
| PATCH  | `/menus/:id`               | name/slug/location/status                                                        |
| DELETE | `/menus/:id`               | soft delete                                                                      |
| POST   | `/menus/:id/restore`       |                                                                                  |
| POST   | `/menus/:id/items`         | create one item, optional `parentId`                                             |
| PATCH  | `/menus/:id/items/:itemId` | edit fields, including single-item reparent                                      |
| DELETE | `/menus/:id/items/:itemId` | rejected if active children exist                                                |
| POST   | `/menus/:id/items/reorder` | bulk `{parentId, sortOrder}` update, one transaction, returns the refreshed tree |

All of the above require `menu.manage`. The two public routes below (Backend Milestone 11.3) require nothing:

| Method | Path                       | Notes                                               |
| ------ | -------------------------- | --------------------------------------------------- |
| GET    | `/public/menus/:location`  | published menu for a placement slot (e.g. `header`) |
| GET    | `/public/menus/slug/:slug` | published menu by slug                              |

## Validation Rules

- **Slug**: auto-generated from `name` if omitted, uniquified per site (reuses `articles/utils/slug.util.ts`, the same cross-module reuse Categories/Tags/Pages already established); shape-validated (lowercase, hyphenated) and uniqueness-checked on manual input.
- **Location** (Backend Milestone 11.4): `(siteId, location)` uniqueness, checked only when `location` is a non-empty value — many menus with no placement is fine, two menus both claiming `"header"` is not. Application-level check (`MenusService.assertLocationAvailable` → `MenusRepository.findByLocation`), the same pattern slug uniqueness already uses — no DB unique constraint added (`Menu.slug` doesn't have one either; staying consistent rather than introducing a new enforcement mechanism for one field). Throws `MenuLocationConflictException` (409), mirroring `MenuSlugConflictException` exactly.
- **Target consistency**: exactly one of `pageId`/`articleId`/`categoryId`/`url` must be set, and it must match `targetType` — enforced in `MenusValidator.validateItemTarget`, not a DB constraint (Postgres has no native "exactly one of N nullable FKs" check worth hand-writing, same reasoning `SeoMeta`'s JSON fields use).
- **Target existence + site ownership**: the referenced Page/Article/Category must exist, not be soft-deleted, and belong to the same site as the menu.
- **Parent validation**: parent item must exist and belong to the same menu; self-parenting rejected; reparenting that would create a cycle rejected (`wouldCreateCycle`, checked against the menu's full flat item list).
- **Delete guard**: a menu item with active (non-deleted) children cannot be deleted — mirrors `CategoriesService.deleteCategory`'s `CategoryInUseException` reasoning exactly, applied to `MenuItem`.
- **Reorder atomicity**: every entry in a `reorder` request is validated (exists in this menu, valid parent, no cycle) _before_ any write — a partial reorder can never be persisted.

## Tree Model

`GET /menus/:id` returns `items` as a nested tree, never flat DB rows. The
mapper fetches the menu's flat, non-deleted `MenuItem[]` (a single query
via Prisma `include`) and assembles it in memory with `buildMenuItemTree`
(`utils/menu-item-tree.util.ts`) — same "fetch once, traverse in memory,
no recursive SQL/CTE" approach as `categories/utils/category-tree.util.ts`'s
`buildTree`. Not literally reusing that generic function: `HierarchyNode`
requires `name`/`slug`, which `MenuItem` doesn't have (`label`, no slug) —
the _algorithm_ is reused, the shape isn't force-fit onto an ill-fitting
generic.

Each returned item also carries a mapper-computed `isBroken: boolean` —
true when `targetType` is PAGE/ARTICLE/CATEGORY but the target FK has gone
`null` (the target was soft-deleted; `onDelete: SetNull` per the 11.1
schema design, so the item survives rather than vanishing or blocking the
target's own deletion).

## Public API (Backend Milestone 11.3)

`PublicMenusController` (`/public/menus`) is a **separate controller**
from `MenusController`, not `@Public()` routes bolted onto it. Reason:
`MenusController` carries a class-level `@UseGuards(PermissionGuard)` +
`@RequirePermission(PERMISSIONS.MENU_MANAGE)`, and `PermissionGuard`
reads `@RequirePermission` metadata off both the handler _and_ the class
(`reflector.getAllAndOverride`) — so a route inside that controller can
never be truly public. `@Public()` only bypasses the global
`JwtAuthGuard`; it does nothing to an explicitly `@UseGuards`-attached
guard. `PublicMenusController` has no guards at all, matching
`AuthController`'s own `@Public()` routes (e.g. `/auth/login`).

`PublicMenusService` is likewise a separate injectable from `MenusService`
— it never needs `MenusValidator`/`AuditLoggerService` (no writes happen
on this path), and isolating it gives a future caching layer (in-memory,
HTTP `Cache-Control`, or Redis) one narrow class to wrap without touching
admin CRUD. No cache is implemented in this pass — only the isolation.

**Route ordering**: `slug/:slug` is registered before the `:location`
catch-all on `PublicMenusController`, same requirement
`ArticlesController`/`PagesController` already follow for their own
`slug/:slug` vs `:id` routes. Verified live: `GET /public/menus/slug/x`
correctly reaches the slug handler rather than being swallowed by
`:location` with `location="slug"`.

## URL Resolution (Backend Milestone 11.4)

`PublicMenusService` resolves every internal target into a real,
frontend-ready path before the response leaves the server — the
frontend never guesses a URL from a slug/targetType pair itself. The
scheme (`constants/menu-url.constants.ts`) is sanctioned directly by this
milestone's own brief, not independently invented:

| targetType                | resolvedUrl                                           |
| ------------------------- | ----------------------------------------------------- |
| PAGE                      | `/{page.slug}` (e.g. `/about`)                        |
| ARTICLE                   | `/blog/{article.slug}` (e.g. `/blog/seo-guide`)       |
| CATEGORY                  | `/category/{category.slug}` (e.g. `/category/travel`) |
| EXTERNAL_URL / CUSTOM_URL | the raw `MenuItem.url` column, unchanged              |

**Resolution flow** (`PublicMenusService.resolveTargetSlugs` →
`MenusMapper.toPublicResponseDto`):

1. Collect the distinct `pageId`/`articleId`/`categoryId` values across
   the menu's items (deduplicated — a menu can link the same Page from
   two different items without doubling the lookup).
2. Batch-fetch each type's slug in **one query per type**
   (`MenusRepository.findPagesByIds`/`findArticlesByIds`/
   `findCategoriesByIds`, all `siteId`-scoped and non-deleted) — never one
   query per item. This closes the same N+1 shape
   `CategoriesRepository.countActiveChildrenForCategories` already
   documents fixing for its own list-shaped call sites.
3. The mapper looks up each item's slug in the batch result and builds
   `resolvedUrl`. **If a target's id is set but its slug isn't found**
   (soft-deleted, or — defensively — belongs to a different site despite
   `MenusService.validateTargetExists`'s own write-time check) **the item
   is omitted from the response**, per this milestone's explicit
   instruction — never returned with a null `resolvedUrl`.

## Public Response (Backend Milestones 11.3–11.4)

`PublicMenuResponseDto`: `id, name, slug, location, items[]` — no
`status`, no audit fields, no `deletedAt` (only PUBLISHED, non-deleted
menus ever reach this DTO, so those fields would be redundant).

`PublicMenuItemTreeNodeResponseDto`: `id, label, targetType, url,
resolvedUrl, isExternal, targetSlug, openMode, icon, cssClass,
children[]` — no `pageId`/`articleId`/`categoryId` (internal ids), no
`layoutMeta`, no `isBroken`, no `parentId`/`sortOrder`, no audit fields,
no permission information. Every field is built explicitly in
`MenusMapper.toPublicResponseDto`/`stripInternalTreeFields` (this
project's `ResponseInterceptor` does not strip fields based on DTO class
decorators — it forwards whatever plain object a service returns — so the
mapper is the actual security boundary here, not the `@ApiProperty()`
list).

- `url` (unchanged since 11.3): the raw `MenuItem.url` column — populated only for EXTERNAL_URL/CUSTOM_URL, `null` otherwise. Kept for backward compatibility; `resolvedUrl` is what a consumer should actually render an `href` from.
- `resolvedUrl` (new): always populated for every item that reaches the response (see "URL Resolution").
- `isExternal` (new): `true` for EXTERNAL_URL/CUSTOM_URL, `false` for PAGE/ARTICLE/CATEGORY.
- `targetSlug` (new): the resolved Page/Article/Category's slug, or `null` for external targets.

## Filtering Rules

- Only `status: PUBLISHED` menus are ever returned (`findPublishedBySlug`/`findPublishedByLocation` filter this at the query level, not in application code) — DRAFT and ARCHIVED menus 404 exactly like a nonexistent one (`MenuNotFoundException`, no distinct "not published yet" error — same not-found-not-forbidden reasoning the admin API's soft-delete checks already use).
- Soft-deleted menus and soft-deleted menu items are excluded at the query level (`deletedAt: null`), same as every admin read path.
- A menu item whose `targetType` is PAGE/ARTICLE/CATEGORY but whose target cannot be resolved — FK gone `null` (soft-deleted, `onDelete: SetNull`) **or** the id is set but no matching slug came back from the batched lookup — is **excluded from the response entirely** — never returned with an `isBroken: true` flag the way the admin API does. Filtering happens in `MenusMapper.toPublicResponseDto` before the tree is built, so an excluded item's still-valid children are simply dropped along with it (no orphan-promotion logic — not asked for, and re-attaching a dropped node's children to its grandparent would be inventing a workflow).

## Cache Strategy (Backend Milestone 11.4)

No cache is implemented — Redis explicitly out of scope for this pass.
Instead, every public read is routed through one seam,
`PublicMenusService.withCache(cacheKey, resolver)`, which today just calls
`resolver()` directly (behavior unchanged from Milestone 11.3). This is
the one call site a future cache implementation needs to touch.

**Recommended future cache keys** (documented, not implemented):

| Method              | Key                        |
| ------------------- | -------------------------- |
| `getMenuByLocation` | `menu:{siteId}:{location}` |
| `getMenuBySlug`     | `menu:{siteId}:{slug}`     |

**Invalidation**: both keys for a given `menu.id` should be invalidated
on any `MenusService` write scoped to that menu — create/update/delete/
restore, or any of its items' create/update/delete/reorder (an item
change can change the published tree without changing the menu row
itself, e.g. adding a child). Wiring that invalidation is a future cache
implementation's responsibility, not this pass's.

## Tree Model

`GET /menus/:id` (admin) and `GET /public/menus/...` (public) both return
`items` as a nested tree, never flat DB rows. The mapper fetches the
menu's flat, non-deleted `MenuItem[]` (a single query via Prisma
`include`) and assembles it in memory with `buildMenuItemTree`
(`utils/menu-item-tree.util.ts`) — same "fetch once, traverse in memory,
no recursive SQL/CTE" approach as `categories/utils/category-tree.util.ts`'s
`buildTree`. Not literally reusing that generic function: `HierarchyNode`
requires `name`/`slug`, which `MenuItem` doesn't have (`label`, no slug) —
the _algorithm_ is reused, the shape isn't force-fit onto an ill-fitting
generic.

The admin response additionally carries a mapper-computed
`isBroken: boolean` per item; the public response never does (see
"Filtering Rules").

## Known Limitations

1. **No inline item creation on `POST /menus`** — items are added via the dedicated `/items` endpoint only, to avoid the "parentId referencing a not-yet-created sibling" problem a nested create would introduce. Not a backend gap, a deliberate scope boundary.
2. **`openMode` bug fixed in Milestone 11.2**: Backend Milestone 11.1 declared the `MenuItemOpenMode` enum but left the `openMode` column as a raw `String` — caught and corrected (migration `20260718184133_menu_item_open_mode_enum`) before the admin module was built on top of it.
3. **No localization** — `Menu` has no `language`/`locale` columns (by design, per the Milestone 11.1 architecture review — V1 stays single-locale like every other module until a real i18n milestone exists).
4. **No caching implemented** — `PublicMenusService.withCache` is structured to be cache-friendly (isolated seam, documented keys, no side effects) but no in-memory/HTTP/Redis cache wraps it yet (see "Cache Strategy").
5. **URL scheme is fixed, not configurable** — `/blog/{slug}` and `/category/{slug}` are hardcoded in `constants/menu-url.constants.ts`, matching this milestone's own examples exactly. If the real Public Website ships a different route structure (e.g. a configurable blog prefix), that one file is the only place to change — not a design flaw, a deliberately narrow single source of truth.

## Future Public Website Integration

- **Caching**: `PublicMenusService.withCache` is the intended wrap point for a future `CacheInterceptor`/Redis layer (see "Cache Strategy" for keys/invalidation) — it's already isolated from all write logic, so caching it only ever risks serving stale reads, never stale-then-broken writes.
- **URL scheme changes**: if the actual Public Website needs a different path shape than `/{slug}` / `/blog/{slug}` / `/category/{slug}`, only `constants/menu-url.constants.ts` needs to change — no controller/service/mapper changes required, by design.
- **Frontend**: the admin Pages-milestone pattern extends directly for the eventual admin UI (`MenuTable`/`MenuForm`, drag-to-reorder Tree View via `POST /menus/:id/items/reorder`, a Target selector backed by the real `GET /pages`/`GET /articles`/`GET /categories/flat` lookups) — none of that is built in this pass (backend-only milestone).
