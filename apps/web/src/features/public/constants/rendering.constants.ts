/**
 * `RenderContext.locale` fallback — no public Site/Settings endpoint
 * exists yet to resolve a real site locale from (see
 * docs/74_PUBLIC_RENDERING_FOUNDATION.md "Known Limitations"). A
 * reasonable frontend-only default, not a stand-in for an invented API.
 */
export const DEFAULT_LOCALE = 'en';

/**
 * Seconds Next.js caches a public fetch before revalidating
 * (`fetch(url, { next: { revalidate } })`). Theme/menu data changes rarely
 * relative to page traffic, so a short time-based window is the "cache
 * boundary" the milestone brief asks for without any invalidation
 * machinery to build yet.
 */
export const PUBLIC_FETCH_REVALIDATE_SECONDS = 60;
