# 78_LAYOUT_ENGINE.md

# Layout Engine (Milestone 14.1)

- **Scope:** A reusable Layout resolution layer inserted between Content and Theme in the existing pipeline: `Route → Resolver → Content → Layout → Theme → Renderer → HTML`. Backend: new `Layout`/`LayoutAssignment` models + admin CRUD + a public resolve endpoint. Frontend: a `LayoutResolver` implementing a 4-tier priority chain, feeding `RenderContext.layout` into the already-existing `ThemeRenderer` (Milestone 13.4), which now reads that decision instead of computing one itself. No Block Engine, no Page Builder, no drag-and-drop — structural resolution only.
- **Status:** Awaiting Review
- **Related:** `74_PUBLIC_RENDERING_FOUNDATION.md`, `76_FRONTEND_PUBLIC_WEBSITE.md`, `77_THEME_RENDERING_SYSTEM.md` (the pipeline/registry/slot patterns this milestone extends), `72_BACKEND_THEMES.md` (the `theme.layout.homepage`/`.blog` fields this milestone's tier 3 reuses unchanged), `71_BACKEND_MENUS.md` (the polymorphic-FK `MenuItem` pattern `LayoutAssignment` mirrors).

---

## 1. Rule Zero Audit — What Already Existed

Verified directly against the real schema/modules before writing any code:

- **No `Layout`/`LayoutAssignment` model, table, or field existed anywhere.** `Page`/`Article`/`Category` have no `layoutId` column; `Site.theme` is a documented-legacy, never-wired `Json?` blob (see the schema's own comment above `model Theme`), not a layout mechanism.
- **`Theme.settings` (JSON) already carries a _theme-level_ layout preset** — `headerLayout`/`footerLayout`/`homepageLayout`/`blogLayout`/`containerWidth`/`borderRadius`/`buttonStyle` (`ThemeSettingsDto`), exposed publicly as `PublicThemeResponseDto.layout.{header,footer,homepage,blog,containerWidth,borderRadius,buttonStyle}`. This is the real "Theme default" tier — reused unchanged, never duplicated.
- **`MenuItem.pageId`/`.articleId`/`.categoryId` + `targetType` enum** is the established "one row references exactly one of several content types" pattern (validated at the service layer, not the DB) — the direct precedent `LayoutAssignment` mirrors.
- **Frontend `theme-renderer/utils/resolve-layout-preset.util.ts` (Milestone 13.4)** already resolves "theme default, else system default" for the `home`/`blog` content areas — kept **completely unchanged**; this milestone's `LayoutResolver` calls it for tiers 3–4 rather than re-implementing that logic.

Since no backend support existed for per-content Layout assignment, `Layout`/`LayoutAssignment` were created — the brief's own explicit instruction for exactly this situation.

---

## 2. Architecture

```
Route → Resolver → Content Loader → RenderContext ⟵ Layout Resolver ⟵ Theme/Menus/Site/Settings
                                            ↓
                                      ThemeRenderer → HTML
```

`load-render-context.ts` now runs in two phases (previously one flat `Promise.all`):

```ts
const [theme, resolvedContent] = await Promise.all([getActiveTheme(), content]);

const [header, footer, secondary, site, settings, layout] = await Promise.all([
  getMenuByLocation(HEADER),
  getMenuByLocation(FOOTER),
  getMenuByLocation(SECONDARY),
  getCurrentSite().catch(() => null),
  getPublicSettings().catch(() => null),
  resolveLayout(resolvedContent, theme), // ← new
]);
```

`resolveLayout()` genuinely needs both `theme` and the resolved `content` (it reads `theme.layout.homepage`/`.blog` and `content.type`/`.slug`), so those two resolve first; everything independent of them (menus/site/settings) still runs in parallel with `resolveLayout` itself in the second phase — not serialized after it.

`RenderContext` gained one new required field:

```ts
interface RenderContext {
  theme;
  menus;
  settings;
  site;
  locale;
  seo;
  content; // unchanged
  layout: LayoutResolution; // { preset: LayoutPresetName; source: LayoutResolutionSource }
}
```

`ThemeRenderer` (13.4, modified) no longer calls `resolveContentArea`/`resolveLayoutPreset` itself — it reads `context.layout.preset` directly:

```ts
export function ThemeRenderer({ context }: { context: RenderContext }) {
  const rendererDefinition = getThemeRenderer(context.theme?.slug);
  const Layout = rendererDefinition.layouts[context.layout.preset]; // ← was resolveLayoutPreset(...)
  const slots = { header: <ThemeHeader .../>, content: <PublicRenderer context={context} />, footer: <ThemeFooter .../> };
  return createElement(Layout, { slots, theme: context.theme });
}
```

This satisfies the milestone's own rule verbatim: **"ThemeRenderer must never know Page / Article / Homepage / Category directly. It only renders Layout + Slots + Content."** Every other 13.4 piece — the 7 layout components, `ThemeLayoutShell`, the 9 named slots, all 17 `Theme*` components, the CSS variable strategy — is **completely unchanged**; this milestone only relocated _which_ preset name `ThemeRenderer` reads, not how it uses one.

---

## 3. Backend

### 3.1 Schema

Two new models (`config/prisma/schema.prisma`), two new enums, both additive — no existing table altered:

```prisma
enum LayoutStatus { DRAFT PUBLISHED ARCHIVED }                       // mirrors ThemeStatus/MenuStatus
enum LayoutAssignmentContentType { HOMEPAGE PAGE ARTICLE CATEGORY }  // mirrors MenuItemTargetType's shape

model Layout {
  id, siteId, themeId?, name, slug, status, layoutPreset (String, open-ended)
  + audit fields (createdAt/createdBy/updatedAt/updatedBy) + soft delete (deletedAt/deletedBy)
  // NO blocks/content field — "structural information only" (the brief's own rule)
}

model LayoutAssignment {
  id, siteId, layoutId, contentType
  pageId?, articleId?, categoryId?   // exactly one set (instance-specific) or none (content-default)
  + audit fields + soft delete
  // onDelete: Cascade on every entity FK (not SetNull, unlike MenuItem) — deliberate,
  // see the model's own doc comment: nulling pageId on a deleted Page would silently
  // turn an instance-specific assignment into a content-type-wide default.
}
```

`layoutPreset` stays a plain `String`, never a Prisma enum — the same "an admin can type anything, unrecognized values fall back gracefully" reasoning `theme.layout.homepage`/`.blog` already establish, so a new frontend preset never needs a migration.

`themeId` is "theme compatibility" — `null` means usable with any theme; set to restrict a Layout to one specific Theme (`onDelete: SetNull`, so deleting that Theme doesn't cascade-delete the Layout).

Migration: `20260719090157_layout_engine_module` — additive only (2 `CREATE TABLE`, 2 `CREATE TYPE`, 0 `ALTER TABLE` on any existing table).

### 3.2 Admin API (`layout.manage` permission, new — added to `PERMISSIONS`)

| Endpoint                                                                          | Purpose                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET/POST /layouts`, `GET/PATCH/DELETE /layouts/:id`, `POST /layouts/:id/restore` | Full CRUD + soft delete/restore, mirroring `ThemesController` exactly (no `activate` — a Layout has no singleton "currently live" flag; many can be PUBLISHED and in use simultaneously via assignments)                                                                                           |
| `GET /layout-assignments[?contentType=]`, `GET /layout-assignments/:id`           | List/get                                                                                                                                                                                                                                                                                           |
| `POST /layout-assignments`                                                        | **Upsert** — assigns/re-assigns a Layout to a target (`layoutId` + `contentType` + at most one of `pageId`/`articleId`/`categoryId`); calling it twice for the same target updates the existing row's `layoutId` rather than erroring, since "assign a layout to X" is naturally a "set" operation |
| `DELETE /layout-assignments/:id`, `POST /layout-assignments/:id/restore`          | Unassign (soft-delete) / restore                                                                                                                                                                                                                                                                   |

`LayoutAssignmentsValidator` enforces the shape rule (mirroring `MenusValidator.validateItemTarget`): HOMEPAGE never sets any entity FK; PAGE/ARTICLE/CATEGORY may set zero (content-default) or exactly the one matching FK, never more than one, never a mismatched one. `assignLayout` additionally verifies `layoutId`/`pageId`/`articleId`/`categoryId` actually exist (via `LayoutAssignmentsRepository.findLayoutById`/`findPageById`/etc. — raw single-purpose Prisma queries, mirroring `MenusRepository`'s own cross-entity check pattern) before writing, so a bad id gets a friendly 404 instead of a raw FK constraint violation.

### 3.3 Public API

**`GET /public/layouts/resolve?contentType=home|page|article|category&slug=...`** (`@Public()`, no auth) — resolves the two DB-backed tiers:

```ts
class PublicLayoutResolutionResponseDto {
  explicitLayoutPreset: string | null; // instance-specific LayoutAssignment, if any
  contentDefaultLayoutPreset: string | null; // content-type-wide default LayoutAssignment, if any
}
```

`slug` is required for every `contentType` except `home` (validated at the service layer, mirroring `MenusValidator`'s own cross-field-rule placement). Slug→id resolution reuses `PublicPagesService`/`PublicArticlesService`/`PublicCategoriesService.resolvePublishedIdBySlug()` — the exact same composition `PublicSeoService` already establishes for `GET /public/seo/:entity/:slug` (`LayoutsModule` imports `PagesModule`/`ArticlesModule`/`CategoriesModule` for this, nothing else). The query is additionally gated to a `PUBLISHED`, non-deleted `Layout` (`findPublishedByTarget`) — a DRAFT/ARCHIVED Layout's preset never leaks publicly, the same "published/active only" rule every other public read path in this codebase enforces.

Both fields independently nullable, never a 404 — "no assignment at this tier" is the common case, not an error.

---

## 4. Frontend — LayoutResolver

`apps/web/src/features/public/layout-engine/resolve-layout.ts`, the actual `LayoutResolver`:

```ts
export async function resolveLayout(content: ResolvedPublicContent, theme: PublicTheme | null): Promise<LayoutResolution> {
  const area = resolveContentArea(content.type);        // reused, unchanged (13.4)
  const query = toPublicLayoutQuery(content);            // new: maps content -> {contentType, slug} | null

  if (query) {
    const { explicitLayoutPreset, contentDefaultLayoutPreset } = await getLayoutResolution(query.contentType, query.slug);
    if (isKnownLayoutPresetName(explicitLayoutPreset))       return { preset: explicitLayoutPreset, source: 'explicit' };
    if (isKnownLayoutPresetName(contentDefaultLayoutPreset)) return { preset: contentDefaultLayoutPreset, source: 'content-default' };
  }

  return {
    preset: resolveLayoutPreset(theme, area),   // reused, unchanged (13.4) — tiers 3 + 4 in one call
    source: /* theme-default if theme.layout.homepage/.blog matched, else system-default */,
  };
}
```

**Priority order, exactly as specified:**

1. **Explicit assignment** — a `LayoutAssignment` tied to this specific Page/Article/Category (or the one Homepage assignment).
2. **Content default** — a `LayoutAssignment` tied to the whole content type, site-wide.
3. **Theme default** — `theme.layout.homepage`/`.blog` (Milestone 13.4, unchanged).
4. **System default** — `'default'` (13.4's own final fallback inside `resolveLayoutPreset`).

A backend-provided preset this app has no registered component for (`isKnownLayoutPresetName`, checked against 13.4's real `LAYOUT_PRESET_NAMES`) is treated as "this tier had nothing" and falls through — never a crash, never a silent bad render.

**`toPublicLayoutQuery`** maps `ResolvedPublicContent` onto the public API's vocabulary, honestly returning `null` (skip the network call entirely) for two cases:

- **`blog-list`** — the backend's `LayoutAssignmentContentType` enum has no "blog listing" member (`/blog` isn't one addressable entity, it's a query over Articles); inventing a fifth value would violate Rule Zero. Falls straight to `theme.layout.blog`.
- **`not-found`** — no entity, and `resolveContentArea('not-found')` is already `'default'`, which never reads a theme field either.

---

## 5. Frontend — Provider / Hook / Registry / Shell

Per the brief's component list, mapped to what already existed vs. what's new:

| Requested                                          | Status               | Location                                                                                                                                                                  |
| -------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LayoutRegistry`                                   | **Reused unchanged** | `theme-renderer/registry/layout-registry.ts` (Milestone 13.4) — `LAYOUT_REGISTRY: Record<LayoutPresetName, ThemeLayoutComponent>`, already exactly "no switch statements" |
| `LayoutShell`                                      | **Reused unchanged** | `theme-renderer/layouts/layout-shell.tsx` (`ThemeLayoutShell`, 13.4) — the shared chrome every preset composes over                                                       |
| `LayoutResolver`                                   | **New**              | `layout-engine/resolve-layout.ts` — §4 above                                                                                                                              |
| `LayoutProvider` / `useLayout()` / `LayoutContext` | **New**              | `layout-engine/layout-context.tsx`                                                                                                                                        |

`LayoutProvider`/`useLayout()` mirror `ThemeProvider`/`useTheme()`'s exact shape — data only, no UI, no fetch. Composed in `PublicContentProvider` alongside `ThemeProvider`/`NavigationProvider` (not inside `ThemeRenderer`, which already has `context.layout` directly and would otherwise instantiate the provider a second, redundant time):

```tsx
<PublicContentContext.Provider value={...}>
  <ThemeProvider theme={theme}>
    <NavigationProvider menus={menus}>
      <LayoutProvider resolution={layout}>{children}</LayoutProvider>
    </NavigationProvider>
  </ThemeProvider>
</PublicContentContext.Provider>
```

Exists for a future _client_ component (e.g. a Visual Builder layout-preview control, §7) that needs the resolved layout reactively without prop-drilling — `ThemeRenderer` itself is a Server Component and never needs the hook.

---

## 6. Slots

Unchanged from Milestone 13.4 — the brief's own list (Header, Hero, BeforeContent, Content, Sidebar, AfterContent, FooterCTA, Footer) is a subset of the 9 slots already implemented (`SLOT_NAMES`, `theme-renderer/slots/`), which additionally includes `primaryNavigation`. This milestone defines no new slot and populates none beyond what 13.4 already populates (`header`/`content`/`footer`) — "Do NOT populate them yet" continues to hold for `hero`/`beforeContent`/`afterContent`/`sidebar`/`footerCta`/`primaryNavigation`.

---

## 7. Tests

**281 frontend tests / 70 files, 1367 backend tests / 166 files (including this milestone's 75 new backend tests across 10 files) — all passing, zero regressions.**

| Area                | Coverage                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend unit        | `LayoutsRepository`/`LayoutAssignmentsRepository` (query shape, exact-match target incl. literal nulls, PUBLISHED-only gate), `LayoutsService`/`LayoutAssignmentsService` (slug uniqueness, theme-compatibility connect/disconnect, upsert-vs-create, target-existence checks), `LayoutsValidator`/`LayoutAssignmentsValidator` (slug shape, preset shape, HOMEPAGE/PAGE/ARTICLE/CATEGORY target rules), `LayoutsMapper`/`LayoutAssignmentsMapper`, `PublicLayoutsService` (slug resolution per entity type, missing-slug 400, explicit/content-default tiers resolved independently, HOMEPAGE single-query collapse) |
| Backend integration | `layout-engine.smoke.spec.ts` — real `AppModule` boot: admin routes 401 without a token, public resolve endpoint reachable without auth, "slug required unless home" enforced end to end, unrecognized `contentType` rejected                                                                                                                                                                                                                                                                                                                                                                                         |
| Frontend resolver   | `resolve-layout.test.ts` — all 4 tiers individually, unknown-preset fallthrough, `blog-list`/`not-found` never call the network, correct `(contentType, slug)` passed per content type                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Frontend service    | `layout-resolve.service.test.ts` — real envelope unwrapping, correct query-string construction, error propagation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Frontend provider   | `layout-context.test.tsx` — provides/throws-outside-provider; `public-content-provider.test.tsx` extended to prove `useLayout()` works through the real composed tree                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Frontend pipeline   | `load-render-context.test.ts` extended — `context.layout` assembled correctly from a mocked explicit-tier result, and confirmed to skip the network call entirely for `not-found`                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| No regressions      | `theme-renderer.test.tsx` rewritten (not deleted) for the new contract — proves `ThemeRenderer` renders purely off `context.layout.preset` regardless of `content.type`, including a `blog-list` case explicitly proving no content-type switch remains; every other 13.1–13.4 test file (renderers, components, registries, layouts) re-run unmodified aside from one mechanical addition (`layout: {...}`) to each literal `RenderContext` fixture, required by the new field                                                                                                                                       |

Validation: `npx tsc --noEmit` (both apps, 0 errors), `npx eslint . --max-warnings=0` (both apps, 0 warnings), `npx jest`/`npx vitest run` (0 failures), `npx next build` (compiles, typechecks, identical route shape to before this milestone).

---

## 8. Remaining Limitations

- **No admin UI for managing Layouts/Assignments.** The brief's "Frontend" section is scoped entirely to the public rendering pipeline (`apps/web`); this milestone did not touch `apps/admin`. The full CRUD API exists and is tested, ready for a future admin screen.
- **`layoutPreset` is validated only against a hand-maintained mirror of the frontend's real preset list**, logged (not rejected) when unrecognized — no shared package exists between `apps/web`/`apps/backend` anywhere in this codebase (verified: `packages/*` are all empty placeholders, never wired into either app), so this is the same manual-sync convention every other cross-app contract in this project already uses.
- **`blog-list` has no explicit/content-default assignment tier** — no backend content type exists for "the blog listing" as a whole (only individual Articles). Falls straight to `theme.layout.blog`, an honest, documented gap rather than an invented backend concept.
- **No UI surfaces `LayoutResolution.source`** (`'explicit' | 'content-default' | 'theme-default' | 'system-default'`) yet — it's tracked and returned by `resolveLayout()` for future debugging/admin-preview use, but no route currently displays it.

---

## 9. Future Compatibility

- **Block Engine** — plugs in exactly where 13.4 already designed for it: a new `PublicRenderer` registry entry for a block-based content type, whose output still flows into `ThemeRenderer`'s unchanged `content` slot. The Layout Engine is orthogonal to it — a Block Engine page still resolves a Layout (structure) the same way any other content type does; blocks are what fills the `content` slot, never a `Layout` field.
- **Visual Builder** — `useLayout()`/`LayoutProvider` are the client-side seam a live layout-preview control needs (read the resolved preset reactively without prop-drilling); `LayoutsController`'s full CRUD API is what a builder's "choose/create a layout" panel would call directly.
- **AI Layout Generator** — a natural consumer of the exact same `POST /layouts` + `POST /layout-assignments` admin API this milestone built — an AI-suggested layout is just another `Layout` row with a generated `name`/`layoutPreset`, assigned the same way a human-created one would be. No new endpoint shape would be needed.
- **Theme Marketplace** — `Layout.themeId` ("theme compatibility") is the seam: a marketplace theme package could ship its own set of Layouts pre-scoped to that Theme via this same nullable FK, without any change to `Layout`/`LayoutAssignment`'s shape.

---

## Cross References

- `74_PUBLIC_RENDERING_FOUNDATION.md` — the original pipeline this milestone's "Layout" stage inserts into.
- `77_THEME_RENDERING_SYSTEM.md` — `LAYOUT_REGISTRY`, `ThemeLayoutShell`, the 7 layout components, the 9 slots, and `resolveLayoutPreset`/`resolveContentArea` — all reused here unchanged, not rebuilt.
- `71_BACKEND_MENUS.md` — the polymorphic-FK `MenuItem` pattern `LayoutAssignment` mirrors, and the repository-level cross-entity existence-check pattern `LayoutAssignmentsService` reuses.
- `72_BACKEND_THEMES.md` — the real `theme.layout.homepage`/`.blog` fields this milestone's tier 3 reads, unchanged.
