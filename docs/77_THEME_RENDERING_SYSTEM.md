# 77_THEME_RENDERING_SYSTEM.md

# Theme Rendering System (Frontend Milestone 13.4)

- **Scope:** A presentation-only Theme Rendering layer inserted between Content and Renderer in the existing pipeline: `Route → Resolver → Content → Theme → Renderer → HTML`. No Block Engine, no Visual Builder, no Homepage Builder — composition and arrangement of content that was already real (Milestones 13.1–13.3), using only real backend theme fields.
- **Status:** Awaiting Review
- **Related:** `74_PUBLIC_RENDERING_FOUNDATION.md` (the pipeline this milestone inserts into), `75_BACKEND_PUBLIC_CONTENT_API.md`, `76_FRONTEND_PUBLIC_WEBSITE.md` (the routes/renderers/content this milestone arranges, unchanged), `72_BACKEND_THEMES.md` / `73_FRONTEND_THEMES.md` (the real `PublicTheme` contract this milestone reads from, never extends).

---

## 1. Architecture

```
Route → Resolver → Content Loader → RenderContext → Theme → Renderer → HTML
                                                       ▲         ▲
                                              (new, 13.4)   (unchanged, 13.1)
```

`PublicLayout` (the one sanctioned composition point, `features/public/components/public-layout.tsx`) now delegates content to `ThemeRenderer` instead of hand-composing `Header + <main><PublicRenderer/></main> + Footer` directly:

```tsx
export function PublicLayout({ context }: { context: RenderContext }) {
  const cssVariables = buildThemeCssVariables(context.theme); // 13.1, unchanged
  return (
    <PublicContentProvider context={context}>
      <div style={cssVariables} data-testid="public-layout">
        <ThemeRenderer context={context} />
      </div>
    </PublicContentProvider>
  );
}
```

Everything upstream of `PublicLayout` — the Resolver, every Content Loader (`content-loader.service.ts`, `load-home-content.ts`, `load-blog-list-content.ts`), `load-render-context.ts`, every provider (`PublicContentProvider`/`ThemeProvider`/`NavigationProvider`), and every backend endpoint — is untouched. Everything downstream — `PublicRenderer` and its six registered content renderers (`PageRenderer`/`ArticleRenderer`/`CategoryRenderer`/`HomeRenderer`/`BlogListRenderer`/`NotFoundRenderer`) — is also untouched: `ThemeRenderer` renders `<PublicRenderer context={context} />` into its own `content` slot, verbatim. Content never knows Theme exists; Theme only arranges what Content already produced.

13.3's `Header`/`Footer` (`features/public/components/`) are kept, unmodified, but no longer used by the live pipeline — superseded by `ThemeHeader`/`ThemeFooter` (§6). Deliberate backward-compatibility, not dead-code oversight (see §11).

---

## 2. Rendering Flow

```
ThemeRenderer({ context })
 ├─ getThemeRenderer(context.theme?.slug)          → ThemeRendererDefinition  (§3)
 ├─ resolveContentArea(context.content.type)        → 'home' | 'blog' | 'default'
 ├─ resolveLayoutPreset(context.theme, area)        → LayoutPresetName        (§5)
 ├─ definition.layouts[preset]                      → the Layout component    (§5)
 └─ createElement(Layout, { slots, theme })
      slots = {
        header:  <ThemeHeader menus theme settings />,
        content: <PublicRenderer context={context} />,   ← unchanged 13.1 output
        footer:  <ThemeFooter menus theme settings />,
      }
```

Three resolutions, zero `switch`/`if` chains scattered across the app — each is exactly one registry/function lookup, in `theme-renderer.tsx` (`apps/web/src/features/public/theme-renderer/renderers/theme-renderer.tsx`):

1. **Theme slug → renderer definition** — `getThemeRenderer(slug)` (§3).
2. **Content type → layout preset name** — `resolveContentArea(type)` then `resolveLayoutPreset(theme, area)` (§5).
3. **Preset name → Layout component** — `definition.layouts[preset]`, a plain object lookup into `LAYOUT_REGISTRY` (§5).

`hero`/`primaryNavigation`/`beforeContent`/`afterContent`/`sidebar`/`footerCta` are reserved slots (§4) that no current content type populates — see §11.

---

## 3. Theme Registry

`registry/theme-registry.ts`:

```ts
export interface ThemeRendererDefinition {
  layouts: Record<LayoutPresetName, ThemeLayoutComponent>;
}

export const DEFAULT_THEME_RENDERER: ThemeRendererDefinition = { layouts: LAYOUT_REGISTRY };

const THEME_RENDERER_REGISTRY: Record<string, ThemeRendererDefinition> = {};

export function getThemeRenderer(themeSlug: string | null | undefined): ThemeRendererDefinition {
  if (!themeSlug) return DEFAULT_THEME_RENDERER;
  return THEME_RENDERER_REGISTRY[themeSlug] ?? DEFAULT_THEME_RENDERER;
}
```

Today `THEME_RENDERER_REGISTRY` is empty and every theme slug resolves to `DEFAULT_THEME_RENDERER` — verified against the real backend: `GET /public/theme` returns exactly one active theme at a time, and nothing in the Themes module (Milestone 11/12) defines a per-theme renderer concept. Adding one would be inventing a feature, not building this milestone. The registry exists as the seam a future Theme Marketplace milestone needs (register a second, third theme-specific renderer definition, keyed by the same real `theme.slug` field) — `getThemeRenderer` never throws on an unregistered slug, so registering a new theme later is additive, not a breaking change to this function's contract.

---

## 4. Slot System

`slots/slot-names.ts` declares the nine slot names from the brief as a `const` object (no magic strings elsewhere):

```ts
export const SLOT_NAMES = {
  HEADER: 'header',
  PRIMARY_NAVIGATION: 'primaryNavigation',
  HERO: 'hero',
  BEFORE_CONTENT: 'beforeContent',
  CONTENT: 'content',
  AFTER_CONTENT: 'afterContent',
  SIDEBAR: 'sidebar',
  FOOTER_CTA: 'footerCta',
  FOOTER: 'footer',
} as const;
```

`ThemeSlots = Partial<Record<SlotName, ReactNode>>` — every slot is optional; a caller only supplies what it has. `Slot` (`slots/slot.tsx`) is the one place "is there anything to show" is decided:

```tsx
export function Slot({ name, children }: { name: SlotName; children?: ReactNode }) {
  if (children === undefined || children === null) return null;
  return <div data-slot={name}>{children}</div>;
}
```

Every layout preset (§5) renders through `Slot`, never raw JSX — `data-slot="…"` on the wrapper is also what the layout/component test suite (§8) asserts against, instead of brittle class-name matching. A slot with no content renders nothing at all (not an empty wrapper div), so an unpopulated `hero`/`sidebar`/`footerCta` never leaves a stray empty element in the DOM.

---

## 5. Layout System

`utils/layout-preset.types.ts` declares the 7 preset names the brief lists (`default`, `full-width`, `boxed`, `centered`, `sidebar-left`, `sidebar-right`, `no-sidebar`) plus `LayoutContentArea = 'home' | 'blog' | 'default'`.

**Preset resolution** (`utils/resolve-layout-preset.util.ts`) reads only real theme fields:

| Content area                          | Reads                   | Reason                                                                                             |
| ------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------- |
| `'home'`                              | `theme.layout.homepage` | Real field, verified in `PublicThemeResponseDto`                                                   |
| `'blog'`                              | `theme.layout.blog`     | Real field — one shared field for both `/blog` and `/blog/[slug]`, not separate list/detail fields |
| `'default'` (page/category/not-found) | _(always `'default'`)_  | No dedicated theme field exists for these content types — inventing one would violate Rule Zero    |

A `null` theme, a `null` field, or a value the app doesn't recognize (an admin can type anything into this open-ended string field) all fall back to `'default'` — never a thrown error, never a guess at an unregistered preset name.

**"Header Fixed" / "Footer Fixed"** (`utils/resolve-chrome-position.util.ts`) reads the same open-ended `theme.layout.header` / `theme.layout.footer` string fields: the literal value `"fixed"` (case/whitespace-insensitive) maps to CSS `sticky` positioning; anything else maps to `static`. `ThemeHeader`/`ThemeFooter` apply this directly — it is not a `LayoutPresetName` concern.

**The 7 layout components** (`layouts/*.tsx`) all share one internal building block, `ThemeLayoutShell` (`layouts/layout-shell.tsx`) — the header/primaryNavigation/hero/footerCta/footer chrome, identical across every preset, plus the `--sportingspy-*` CSS variable application (§7). Each preset component supplies only its distinct _content-area_ arrangement as `children`:

| Preset          | Content-area arrangement                                                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default`       | Single column, standard container width                                                                                                               |
| `no-sidebar`    | Functionally identical to `default` — a distinct, explicit name so an admin can affirmatively choose "no sidebar" rather than relying on the fallback |
| `full-width`    | No `container-page` max-width constraint                                                                                                              |
| `boxed`         | Content sits inside a bordered, rounded card within the standard container                                                                            |
| `centered`      | Narrower (`max-w-2xl`) centered column — for text-heavy single-column reading                                                                         |
| `sidebar-left`  | Two-column grid, sidebar column first, only rendered if `slots.sidebar` is populated (collapses to one column otherwise)                              |
| `sidebar-right` | Same, sidebar column last                                                                                                                             |

`registry/layout-registry.ts` maps all 7 preset names to their component (`LAYOUT_REGISTRY: Record<LayoutPresetName, ThemeLayoutComponent>`), the object `ThemeRendererDefinition.layouts` (§3) points at — one plain object lookup, no `switch`.

`hooks/use-layout-preset.ts` (`'use client'`) wraps `useTheme()` (13.1) + `resolveLayoutPreset` for a future Client Component that needs the resolved preset reactively (e.g. a Visual Builder live preview, §12) — `ThemeRenderer` itself is a Server Component and calls `resolveLayoutPreset` directly, never this hook.

---

## 6. Components (17)

All under `theme-renderer/components/`, every one reading only `--sportingspy-*` CSS variables for color/spacing/radius — never a hardcoded hex value or Tailwind gray shade:

| Component         | Role                                                                                                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ThemeContainer`  | Content-width wrapper (`container-page` + responsive padding), `fullWidth` escape hatch                                                                                    |
| `ThemeSection`    | Vertical section wrapper with an optional `ThemeTitle` heading                                                                                                             |
| `ThemeSidebar`    | Wraps sidebar-slot content; falls back to `ThemeEmptyState` when empty (no widget system exists yet — §11)                                                                 |
| `ThemeCard`       | Generic bordered card; renders as `<Link>` if `href` given, else a plain `<div>`                                                                                           |
| `ThemeArticle`    | Themed article summary card (`ThemeCard` + `ThemeTitle` + `ThemeMeta`) — design-system equivalent of 13.3's `article-card.tsx`, not yet adopted by any live renderer (§11) |
| `ThemeCategory`   | Themed category summary card, same "not yet adopted" status                                                                                                                |
| `ThemeButton`     | `<Link>` when `href` given, native `<button>` otherwise; `primary`/`secondary`/`outline` variants; deliberately no `onClick` (§9)                                          |
| `ThemeTitle`      | `h1`–`h4` heading, tag and size/weight styling chosen together via one `level` prop (`createElement`, never a stringly-typed `<h${level}>`)                                |
| `ThemeMeta`       | Inline "author · date · reading time" row; filters out null/undefined items, omits stray separators                                                                        |
| `ThemeBreadcrumb` | Trail of links, last item plain text with `aria-current="page"`                                                                                                            |
| `ThemePagination` | Prev/Next `<Link>`s from real `PaginationMeta`; renders nothing when everything fits on one page; plain links, works with JavaScript disabled                              |
| `ThemeSearch`     | Native `method="get"` search form; no client JS                                                                                                                            |
| `ThemeEmptyState` | Generic "nothing here" message, `role="status"`                                                                                                                            |
| `ThemeError`      | `role="alert"` error display; optional `onRetry` callback                                                                                                                  |
| `ThemeLoading`    | `role="status" aria-live="polite"` skeleton, using `--sportingspy-color-surface` so it stays legible in dark mode                                                          |
| `ThemeHeader`     | Site header: logo/site-name, `NavMenu` (13.3, reused unchanged) for the real menu tree, sticky/static via `resolveChromePosition(theme?.layout.header)`                    |
| `ThemeFooter`     | Site footer: site-name/tagline, `NavMenu`, copyright line, same positioning logic for `theme.layout.footer`                                                                |

`ThemeHeader`/`ThemeFooter` are the only two of the 17 actually wired into the live pipeline today (via `ThemeRenderer`'s `header`/`footer` slots) — the other 15 are available building blocks for a future renderer to compose with (see §11, §12).

---

## 7. CSS Variable Strategy

Two builder functions, deliberately separate, applied at two different points in the tree:

| Function                         | File                                                            | Applied on                                                                          | Variables produced                                                                                         |
| -------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `buildThemeCssVariables`         | `features/public/utils/css-variables.util.ts` (13.1, unchanged) | `PublicLayout`'s outer div (`data-testid="public-layout"`)                          | `--sportingspy-color-primary`/`-secondary`, `--sportingspy-container-width`, `--sportingspy-border-radius` |
| `buildExtendedThemeCssVariables` | `theme-renderer/utils/theme-css-variables.util.ts` (new, 13.4)  | `ThemeLayoutShell`'s wrapper (`data-testid="theme-layout-shell"`), one level deeper | Above, plus `--sportingspy-color-accent`, `--sportingspy-radius` (alias), `--sportingspy-font-family`      |

`buildExtendedThemeCssVariables` is additive, not a replacement — 13.1's `PublicLayout` variable application keeps working exactly as it did before this milestone (verified: `public-layout.test.tsx`, unmodified, still passes). Every value is real or directly derived from a real field, never invented:

- `--sportingspy-color-accent` = `theme.colors.secondary ?? theme.colors.primary` — real data, no color math.
- `--sportingspy-radius` mirrors the same real `theme.layout.borderRadius` field 13.1 already exposes as `--sportingspy-border-radius`.
- `--sportingspy-font-family` reads `typography.fontFamily` defensively (`typography` is free-form JSON with no fixed schema, verified against `PublicThemeResponseDto`) — omitted if absent or not a string.

**Static, non-theme-sourced tokens** — `--sportingspy-color-background`/`-surface`/`-border`/`-text`/`-muted` and the `--sportingspy-spacing-*` scale — are defined only in `styles/globals.css`, never computed in JavaScript. `ThemeSettingsDto`/`PublicThemeResponseDto` were verified to have no such fields (only `primaryColor`/`secondaryColor` exist) — Rule Zero forbids inventing backend theme settings, so every theme shares the same fixed values for these tokens today.

**Dark mode.** This split is what makes dark mode work at all: an inline `style` attribute (JavaScript-computed, per-request) always wins the CSS cascade over a stylesheet rule, even a more specific one. If the static tokens were set inline like the real theme ones, a `@media (prefers-color-scheme: dark)` override in `globals.css` could never apply — inline always wins. Since these five tokens are declared _only_ in the stylesheet, the dark-mode media query cleanly overrides them for a visitor whose OS/browser prefers dark, while the real theme-sourced tokens (primary/accent/radius/etc.) stay exactly what the active theme set, unaffected by color scheme. No backend `appearanceMode` field exists anywhere in the schema — this is "prepare architecture only," driven by a real native browser signal, never a fabricated setting (per the brief).

---

## 8. Tests

256 tests across 66 files pass (`npx vitest run`), including the full pre-existing 13.1–13.3 suite untouched, plus all new 13.4 coverage:

| Area                                            | Coverage                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme Registry                                  | Resolves any real/unregistered/null/undefined slug to the one default definition, never throws                                                                                                                                                                                                             |
| Layout Registry                                 | All 7 presets registered exactly once, `getLayoutComponent` resolves correctly                                                                                                                                                                                                                             |
| Slot Renderer                                   | Renders `data-slot` wrapper for real content; renders nothing for `undefined`/`null`; correctly renders falsy-but-real content (`0`)                                                                                                                                                                       |
| Layout components (×7)                          | Header/content/footer slot rendering, hero/sidebar/footerCta omitted when absent, sidebar column order (left vs. right) and collapse-to-one-column when `sidebar` is unpopulated, `boxed`'s card wrapper, `centered`'s narrower column, `full-width`'s missing container class                             |
| CSS Variable Generator                          | `buildExtendedThemeCssVariables` — accent fallback, radius/font-family/container-width inclusion/omission, `theme: null` → `{}`                                                                                                                                                                            |
| `resolveLayoutPreset` / `resolveChromePosition` | Every area/theme/value combination, including unknown-string and null fallbacks                                                                                                                                                                                                                            |
| `ThemeHeader` / `ThemeFooter`                   | Site name/logo fallback chain, menu rendering via `NavMenu`, sticky positioning toggle                                                                                                                                                                                                                     |
| `ThemeSidebar`                                  | Children vs. `ThemeEmptyState` fallback, landmark role                                                                                                                                                                                                                                                     |
| All 17 Theme* components                        | One dedicated test file each (button variants incl. `href`/disabled, title heading levels, meta filtering/separators, breadcrumb `aria-current`, card link/non-link, article/category card field rendering, pagination prev/next/extraParams, search action/defaultValue, empty-state/loading/error roles) |
| `ThemeRenderer` (end-to-end)                    | Registry resolution → content-area resolution → layout-preset resolution → slot assembly, verified for `page`(default)/`home`(theme-driven)/`blog-list`(theme-driven, independent of homepage)/`theme: null` cases                                                                                         |
| No regressions                                  | Full 13.1–13.3 suite re-run unmodified alongside the new tests — 0 failures                                                                                                                                                                                                                                |

Validation commands run clean: `npx tsc --noEmit` (0 errors), `npx eslint . --ext .ts,.tsx,.js --max-warnings=0` (0 warnings), `npx vitest run` (256/256 passed), `npx next build` (compiles, typechecks, and generates all routes — `/` and the `[slug]` routes correctly server-rendered on demand, only the generic `/_not-found` prerendered as static).

---

## 9. Accessibility

- Semantic landmarks throughout: `<header>`, `<nav aria-label="Primary">`/`aria-label="Pagination"`/`aria-label="Breadcrumb"`, `<aside aria-label="Sidebar">`, `<footer>`, `role="search"`/`role="alert"`/`role="status"`.
- `ThemeBreadcrumb`'s current page uses `aria-current="page"` rather than another link.
- `ThemeLoading` uses `aria-live="polite"` so assistive tech announces the loading state without interrupting.
- Keyboard navigation: `ThemeHeader`'s desktop dropdowns and mobile disclosure reuse `NavMenu`'s existing CSS-only (`group-hover`/`group-focus-within`, native `<details>`) approach (13.3, unchanged) — reachable and operable via keyboard with zero client JavaScript.
- `:focus-visible` styling (`globals.css`) uses the real `--sportingspy-color-primary` token, so focus rings adapt to the active theme's brand color instead of a hardcoded blue.
- `ThemeButton` deliberately has no `onClick` prop: a Server Component (which this is) cannot pass an event-handler function across the server/client boundary without becoming a Client Component itself. A future interactive use case should wrap `ThemeButton` in its own small `'use client'` component rather than adding a handler prop here — documented directly in the component's own doc comment.

---

## 10. Responsive Design

No duplicated render logic per breakpoint — every layout/component uses Tailwind's responsive utility prefixes (`sm:`/`lg:`) on the same markup, the same pattern 13.1–13.3 already established:

- `ThemeHeader` — desktop nav hidden below `lg:`, replaced by a `<details>` mobile disclosure; both render from the identical `headerItems` array, never two separate trees.
- `sidebar-left`/`sidebar-right` layouts — single column below `lg:`, two-column grid at `lg:` and above (verified: the grid class list has no `lg:grid-cols-*` at all when `sidebar` is unpopulated, collapsing to a genuine single column rather than an empty second column).
- `ThemeContainer`/every layout's content wrapper — responsive horizontal padding (`px-4 sm:px-6 lg:px-8`) at every breakpoint.

---

## 11. Remaining Limitations

- **`ThemeArticle`/`ThemeCategory` are not yet adopted by `home-renderer.tsx`/`blog-list-renderer.tsx`.** Those two renderers still use 13.3's original `ArticleCard`/`CategoryCard` (`features/public/components/`) directly — both content-type renderers were explicitly left untouched this milestone ("DO NOT modify or break Milestone 13.3"). `ThemeArticle`/`ThemeCategory` exist as the design-system equivalents a future milestone can swap in without inventing new markup.
- **`sidebar`/`hero`/`primaryNavigation`/`beforeContent`/`afterContent`/`footerCta` slots are always empty in the live pipeline.** `ThemeRenderer` only ever populates `header`/`content`/`footer` (§2) — no current content type has a backend-driven concept of sidebar widgets, a separate primary-nav location beyond the header's own menu, or pre/post-content inserts. `ThemeSidebar`'s empty-state fallback and every unpopulated `Slot`'s "render nothing" behavior were both built specifically so these reserved slots are inert today, not broken.
- **13.3's `Header`/`Footer` are unused dead weight in the live pipeline**, kept only for backward compatibility and to avoid deleting working, tested code outside this milestone's mandate. A future cleanup milestone could remove them once nothing else references them.
- **No admin-facing layout-preset picker exists.** `theme.layout.homepage`/`.blog`/`.header`/`.footer` are read as opaque strings from the real backend field — whatever the Themes admin UI (Milestone 11/12, unchanged) currently allows an operator to type into those fields is what this milestone honors. This milestone did not add or change any admin UI.
- **`notFound()`'s HTTP-status caveat from Milestone 13.3 (`76_FRONTEND_PUBLIC_WEBSITE.md` §11) is unchanged and unrelated to this milestone** — Theme Rendering sits entirely inside `PublicLayout`, downstream of where that issue originates (the route's own `notFound()` call).

---

## 12. Future Compatibility

This exact Theme Rendering System — registry, slots, layouts, components — is designed to be reused unchanged by the milestones the brief names next, never hardcoded around today's specific pages:

- **Future Block Engine Integration.** A Block Engine would introduce a new `ResolvedPublicContent` member (e.g. `{ type: 'block-page', blocks: Block[] }`) and a new `PublicRenderer` registry entry that renders `blocks` into React elements — exactly the same "add a registry entry" extension point `category`/`home`/`blog-list` already proved out in 13.3 (`76_FRONTEND_PUBLIC_WEBSITE.md` §10). That new renderer's output still flows into `ThemeRenderer`'s unchanged `content` slot; a Block Engine block could itself be built from `ThemeCard`/`ThemeButton`/`ThemeTitle`/etc. rather than one-off markup, since these are already presentation-only and content-agnostic.
- **Future Visual Builder Integration.** A Visual Builder needs exactly the seams already built for it: `useLayoutPreset()` (§5) for a live client-side preview of the resolved layout without prop-drilling; `THEME_RENDERER_REGISTRY` (§3) for previewing a specific theme's renderer definition ahead of it being the site's active theme; the `Slot`/`ThemeSlots` contract (§4) for a builder to compose arbitrary content into any of the 9 named slots without the builder needing to know how any given layout arranges them internally.
- **Future Homepage Builder / Landing Builder / Theme Marketplace.** Each is additive at exactly one seam this milestone built for that purpose: a Homepage/Landing Builder would populate `hero`/`beforeContent`/`afterContent`/`sidebar`/`footerCta` (§11's currently-inert slots) with real builder-authored content, and a Theme Marketplace would register additional `ThemeRendererDefinition`s in `THEME_RENDERER_REGISTRY`, keyed by the same real `theme.slug` the registry already reads. None of `ThemeRenderer`, the layout registry, the slot system, or any of the 17 components would need to change shape for any of these — only new registry entries and new slot content, the same extension pattern proven in §3/§5/§11.

---

## Cross References

- `74_PUBLIC_RENDERING_FOUNDATION.md` — the pipeline (Route → Resolver → Content → Renderer → HTML) this milestone inserts Theme into, and the registry pattern this milestone's Theme Registry / Layout Registry follow.
- `75_BACKEND_PUBLIC_CONTENT_API.md` — every endpoint this milestone's data ultimately comes from (unchanged, not touched this milestone).
- `76_FRONTEND_PUBLIC_WEBSITE.md` — the real routes, renderers, and content this milestone arranges; its §11 `notFound()` caveat, unaffected by this milestone.
- `72_BACKEND_THEMES.md` / `73_FRONTEND_THEMES.md` — the real `PublicTheme`/`ThemeSettingsDto` contract every CSS variable and layout-preset decision in this milestone reads from, and never extends.
