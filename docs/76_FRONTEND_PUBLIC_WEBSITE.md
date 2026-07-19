# 76_FRONTEND_PUBLIC_WEBSITE.md

# Frontend Public Website (Frontend Milestone 13.3)

- **Scope:** The first production-ready public website in `apps/web`, built entirely on top of the Milestone 13.1 rendering pipeline and consuming the real Milestone 13.2 Public Content API. No rendering architecture was rewritten — this milestone reconciled 13.1's provisional types against the now-real backend contracts, then built real routes, renderers, and UI on top.
- **Status:** Awaiting Review
- **Related:** `74_PUBLIC_RENDERING_FOUNDATION.md` (the pipeline this milestone fills in), `75_BACKEND_PUBLIC_CONTENT_API.md` (every endpoint consumed here), `53_API_FREEZE.md`.

---

## 1. Architecture

Unchanged from Milestone 13.1: `Route → Resolver → RenderContext → Renderer → HTML`, via `PublicLayout` composing `PublicContentProvider` (→ `ThemeProvider`/`NavigationProvider`) around `Header` + `PublicRenderer` + `Footer`. What changed this milestone:

- **Types reconciled against real DTOs.** 13.1's `content.types.ts` was explicitly documented as a provisional placeholder ("not guaranteed to be the final public shape"). Verified against the real, live `PublicPageResponseDto`/`PublicArticleListItemDto`/`PublicArticleResponseDto`/`PublicCategoryResponseDto` (Milestone 13.2) — every field was checked; `id`/`status` do not exist on any of them and were removed; real fields (`readingTime`, `wordCount`, `language`, `locale`, `canonicalUrl`, `articleCount`) were added.
- **`content-loader.service.ts`/`site.service.ts`/`settings.service.ts` are now real** — every `PublicContentUnavailableError` stub from 13.1 is gone; each function calls its real endpoint (see §8's API mapping table).
- **The "unavailable" content type/renderer is deleted.** It existed solely to represent "no backend endpoint yet" — with every endpoint now real, there is no such state left to represent.
- **`ResolvedPublicContent` grew two new members**: `home` and `blog-list` — routes whose real input isn't a slug (see §3, §5).
- **Every registered renderer now receives the whole `RenderContext`**, not just `content` — `HomeRenderer` needs `context.settings` for site branding, which a narrower prop couldn't supply. `PageRenderer`/`ArticleRenderer`/`CategoryRenderer`/`NotFoundRenderer` narrow `context.content` internally; this is a compatible evolution of 13.1's registry pattern, not a rewrite of it.

---

## 2. Routes

| Route              | File                           | Resolver called                                            |
| ------------------ | ------------------------------ | ---------------------------------------------------------- |
| `/`                | `app/page.tsx`                 | `loadHomeContent()`                                        |
| `/page/[slug]`     | `app/page/[slug]/page.tsx`     | `resolveContent('/page/{slug}')`                           |
| `/blog`            | `app/blog/page.tsx`            | `loadBlogListContent(page, search)`                        |
| `/blog/[slug]`     | `app/blog/[slug]/page.tsx`     | `resolveContent('/blog/{slug}')`                           |
| `/category/[slug]` | `app/category/[slug]/page.tsx` | `resolveContent('/category/{slug}')`                       |
| 404                | `app/not-found.tsx`            | n/a — assembles a `{ type: 'not-found' }` context directly |

Every route component is `async`, calls `loadRenderContext(...)`, and renders `<PublicLayout context={context} />` — none fetches directly, matching "Never fetch directly inside page components." `notFound()` (from `next/navigation`) is called whenever `context.content.type === 'not-found'` on the three slug routes, so Next's `app/not-found.tsx` boundary renders (see §9 for a caveat on the HTTP status this produces).

`/blog/[slug]`'s URL segment is `blog`, but the content type it resolves to is `article` — the site's own routing choice (`/blog` reads better publicly) mapped onto the real `Article` entity; see `route-shape.util.ts`'s doc comment.

---

## 3. Rendering Flow

```
loadRenderContext(content)
 ├─ getActiveTheme()         (real, GET /public/theme, cache())
 ├─ getMenuByLocation(...)   ×3 (real, GET /public/menus/:location, cache())
 ├─ getCurrentSite().catch(() => null)      (real, GET /public/site)
 ├─ getPublicSettings().catch(() => null)   (real, GET /public/settings)
 └─ content                  (already in flight — see below)
      ↓
   RenderContext { theme, menus, site, settings, locale, seo, content }
      ↓
   PublicLayout → PublicContentProvider → Header + PublicRenderer + Footer
```

`content` is supplied by the caller, not fetched inside `loadRenderContext` itself:

- **Slug routes** (`/page`, `/blog/[slug]`, `/category/[slug]`) pass `resolveContent(pathname)` — matches the URL shape, delegates to the real Content Loader, and turns a real backend 404 into `{ type: 'not-found' }` (a genuine 404, not "endpoint missing" — that state no longer exists).
- **`/`** passes `loadHomeContent()` — composes `GET /public/articles` (twice, different pages — see §9) and `GET /public/categories`, no dedicated homepage endpoint (none exists, none invented).
- **`/blog`** passes `loadBlogListContent(page, search)` — one real, paginated `GET /public/articles` call with the request's own `page`/`search` forwarded.

`site`/`settings` fetch failures resolve to `null` (`.catch(() => null)`) rather than failing the whole render — they're supplementary branding context, not the page's main content; `theme`/`menus`/`content` are not caught the same way, since a genuine failure there should surface via `app/error.tsx`.

---

## 4. Providers

Unchanged composition from 13.1 (`PublicContentProvider` → `ThemeProvider`/`NavigationProvider`). New this milestone: `Header`/`Footer` deliberately receive `menus`/`theme`/`settings` as **props**, not via `useNavigation()`/`useTheme()` — both are Server Components already handed `context` by `PublicLayout` (itself a Server Component), so reaching for a Client-Component-only hook would cost a client boundary for data already in hand (Performance: "Server Components first"). The hooks remain exactly as 13.1 left them, for a genuine future Client Component that needs theme/nav programmatically.

---

## 5. Navigation (Header/Footer)

`GET /public/menus/header` / `GET /public/menus/footer` (real, unchanged from 13.1) feed `NavMenu`, a recursive Server Component: unlimited depth via `NavMenuItem` calling itself over `item.children`, dropdown disclosure via pure CSS (`group-hover`/`group-focus-within` at depth 0, `group-hover/child` flyout-right at depth ≥1) — no client JavaScript. Mobile navigation uses a native `<details>/<summary>` disclosure (keyboard-accessible, zero JS). No link is hardcoded — every item renders from `item.resolvedUrl`/`item.label`/`item.children`, server-resolved by the backend (Milestone 11.4).

---

## 6. Home Page

Composition only, per the brief — no Block Engine, no drag-and-drop, no JSON layout. `HomeRenderer` composes six plain components in a fixed order: `Hero`, `ArticleListSection` (×2, parameterized — "Latest Articles" / "Featured Articles"), `CategoryGridSection`, `NewsletterCta`, `FooterCta`. Every section is a reusable component taking real data as props; none fetches. See §9 for the two judgment calls this section required (Featured Articles, Newsletter CTA).

---

## 7. SEO

Every detail route (`/page/[slug]`, `/blog/[slug]`, `/category/[slug]`) exports `generateMetadata`, built by `buildMetadataFromSeo()` from the content's own embedded `seo` field — `PublicPageResponseDto.seo`/`PublicArticleResponseDto.seo`/`PublicCategoryResponseDto.seo` (Milestone 13.2) already carry `title`/`description`/`canonicalUrl`/`keywords`/`openGraph`/`twitterCard`/`robots`. `openGraph`/`twitterCard`/`robots` are free-form JSON on the backend (no fixed schema), so every sub-field read is defensively type-checked rather than assumed present.

**JSON-LD** has no Next.js Metadata API field — `seo.schemaJson` is injected via a `<script type="application/ld+json">` (`components/json-ld.tsx`), with `<` escaped to `<` before serialization (standard mitigation against a string value breaking out of the script tag).

**The dedicated `GET /public/seo/:entity/:slug` endpoint is real, wired, and tested (`services/seo.service.ts`) but not called by any shipped route.** Every route needing SEO data already fetches the full entity (to render the page body), which embeds an equivalent `seo` object — calling the separate endpoint too would be exactly the duplicate request Performance forbids. It remains available for a genuine future case: SEO data needed without the full entity.

`/` and `/blog` have no per-route `generateMetadata` — `app/layout.tsx`'s own `generateMetadata()` (site name/tagline/favicon, from `GET /public/site` + `GET /public/settings` + `GET /public/theme`) already covers them; `/blog`'s only addition is a search-aware description, set directly.

---

## 8. API Mapping

| Function                        | Endpoint                            | Cached?                                               |
| ------------------------------- | ----------------------------------- | ----------------------------------------------------- |
| `getActiveTheme()`              | `GET /public/theme`                 | `cache()` (13.1)                                      |
| `getMenuByLocation(loc)`        | `GET /public/menus/:location`       | `cache()` (13.1)                                      |
| `getCurrentSite()`              | `GET /public/site`                  | `cache()` (new)                                       |
| `getPublicSettings()`           | `GET /public/settings`              | `cache()` (new)                                       |
| `getPageBySlug(slug)`           | `GET /public/pages/slug/:slug`      | via `resolveContent` `cache()`                        |
| `getArticleBySlug(slug)`        | `GET /public/articles/slug/:slug`   | via `resolveContent` `cache()`                        |
| `getCategoryBySlug(slug)`       | `GET /public/categories/slug/:slug` | via `resolveContent` `cache()`                        |
| `listArticles(params)`          | `GET /public/articles?...`          | via `loadHomeContent`/`loadBlogListContent` `cache()` |
| `listCategories(params)`        | `GET /public/categories?...`        | via `loadHomeContent` `cache()`                       |
| `getSeoForEntity(entity, slug)` | `GET /public/seo/:entity/:slug`     | `cache()` — real, unused by shipped routes (see §7)   |

---

## 9. Performance

- **Server Components first** — every route, `Header`, `Footer`, every renderer, and every Home section is a Server Component. The only Client Components in this app are `app/error.tsx` (a Next.js requirement for error boundaries) — nothing else needed one.
- **No duplicate API calls** — `resolveContent`/`loadHomeContent`/`loadBlogListContent` are wrapped in React's `cache()`, keyed on primitive arguments (a pathname string, or explicit `page`/`search` strings rather than a `searchParams` object — object identity isn't guaranteed stable across `generateMetadata`/the page component, primitives are). Each route's `generateMetadata` and page component call the identical cached function, so they dedupe to exactly one backend request, verified by inspecting each route's implementation side by side.
- **Streaming** — `app/loading.tsx` (a skeleton, `PublicLoading`) streams in automatically for any route mid-fetch (Next.js's `loading.tsx` convention).
- **Parallel fetching** — `loadRenderContext` fetches theme/3 menus/site/settings/content via one `Promise.all`; `loadHomeContent` fetches latest articles/featured articles/categories via another.
- **`/` is `export const dynamic = 'force-dynamic'`**, not statically prerendered — verified directly: a `next build` attempted with the backend unreachable throws `PublicApiError`/`NETWORK_ERROR` during static generation and aborts the entire build. A production build must not depend on a live backend connection to succeed; `force-dynamic` defers that fetch to request time (still cached per-request at the `fetch` layer via `revalidate: 60`).

---

## 10. Future Layout Integration

- **Layout Engine → Block Engine → Visual Builder** — each plugs into `RENDERER_REGISTRY` as new content types/components, exactly as 13.1 designed. This milestone adds proof of that claim: `category`/`home`/`blog-list` were added as three ordinary new registry entries, with zero changes to `PublicRenderer`, `PublicLayout`, or any provider.
- **Real `Page`/`Article` body rendering** — still an inert placeholder (`page-renderer.tsx`/`article-renderer.tsx`). Turning `body`'s opaque JSON into real HTML is Block/Rich-Content Engine work, explicitly out of scope for this milestone and the two before it.
- **Category article filtering** — once `GET /public/articles` gains a `categorySlug` filter (see `75_BACKEND_PUBLIC_CONTENT_API.md` "Future Integration"), `CategoryRenderer`'s "related articles" note becomes a real `ArticleListSection`.

---

## 11. Known Limitations

- **`notFound()` does not set the HTTP 404 status code for the three slug-addressed detail routes, in this exact Next.js 16.2.10 + Turbopack production build.** Verified thoroughly: `/page/[slug]`/`/blog/[slug]`/`/category/[slug]` correctly _render_ the branded not-found UI (header, footer, theme, "Page not found" copy — confirmed by inspecting the response body) for an unknown/unpublished slug, but the HTTP response status is `200`, not `404`. A genuinely unmatched URL (no route file matches at all) correctly returns `404` — proving Next's own default 404 handling works in this environment. Isolated via a from-scratch minimal repro (a bare dynamic `[slug]` route calling `notFound()` conditionally, with no `generateMetadata`, no `loading.tsx`, and `export const dynamic = 'force-dynamic'` explicitly set) — the minimal case exhibits the same behavior, so this is not caused by this app's own code paths (`cache()`, `generateMetadata`, streaming, or anything else specific to this milestone). This reads as a Next.js 16.2.10/Turbopack-specific behavior; recommend filing/checking an upstream Next.js issue, or re-testing against the Webpack compiler or a different Next.js patch version, as a follow-up. **User-facing behavior is unaffected** (visitors and crawlers see the correct branded 404 page); the gap is specifically the HTTP status code a status-code-aware client (search engine, monitoring tool, `curl -I`) would observe.
- **"Featured Articles" is not a real backend concept.** No `Article.isFeatured` field, or any other distinguishing signal, exists anywhere in the schema or the Public Articles API (verified: `PublicArticleQueryDto`/`ArticleSortField` have no such option). Inventing one would violate Rule Zero. `loadHomeContent()` instead shows the _next page_ of the same real, chronologically-sorted list "Latest Articles" already shows page 1 of — an honest stand-in, not a fabricated feature. A real Featured Articles feature needs a backend change (e.g. an `Article.isFeatured` column or a homepage curation table).
- **The Newsletter CTA is presentational only.** No `newsletter_subscriptions` endpoint exists anywhere in the backend (explicitly deferred to V2/V3 per `31_DATABASE_TABLES.md`). The form has no `action` and its input/button are `disabled`, with a visible "coming soon" note — it never pretends to submit anywhere.
- **Category pages show no related-articles list.** `GET /public/articles` has no `categorySlug`/`categoryId` filter param (verified against the real DTO) — there is no way to ask the backend for "articles in this category." `CategoryRenderer` discloses this honestly rather than omitting it silently.
- **No cover/featured image renders on article pages.** `GET /public/articles(/slug/:slug)` exposes no image URL field — `Article.featuredMediaId` exists on the model but was excluded from the Public DTO as an internal id (Milestone 13.2), and no resolved public image URL field was added in its place.
- **`Header`'s mobile menu and desktop dropdown are CSS-only** (`<details>`, `group-hover`/`group-focus-within`) — functional and keyboard-reachable, but not a full ARIA disclosure-pattern implementation (no dynamic `aria-expanded` toggling, since that requires client JS this milestone deliberately avoided for a Server-Components-first nav). Acceptable for this milestone; worth revisiting if a strict WCAG audit is required later.

---

## Cross References

- `74_PUBLIC_RENDERING_FOUNDATION.md` — the pipeline, provider composition, and registry pattern this milestone fills in with real routes.
- `75_BACKEND_PUBLIC_CONTENT_API.md` — every endpoint's exact contract, security model, and its own known limitations (category filtering, Settings allowlist, no Site admin surface).
- `41_PLATFORM_CAPABILITIES.md` — "Homepage Builder"/"Widget System" (still V2/V3 scope; this milestone's Home page is fixed composition, not a builder).
