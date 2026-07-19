export type MatchedContentRoute =
  | { type: 'page'; slug: string }
  | { type: 'article'; slug: string }
  | { type: 'category'; slug: string };

/**
 * Pure URL-shape matcher for the three slug-addressed detail routes this
 * app ships (Milestone 13.3): `/page/{slug}`, `/blog/{slug}`,
 * `/category/{slug}` — matching the real Next.js route files
 * (`app/page/[slug]/page.tsx`, `app/blog/[slug]/page.tsx`,
 * `app/category/[slug]/page.tsx`). The `blog` URL segment maps to content
 * `type: 'article'` — the URL is the site's own routing choice ("blog" is
 * the public-facing term), while `article` is the real backend entity name
 * (`Article` model, `ArticlesController`) this app fetches.
 *
 * `/` (home) and `/blog` (the list page) are NOT slug-addressed and are
 * deliberately not matched here — each has its own dedicated
 * resolver (`resolver/load-home-content.ts` / `resolver/load-blog-list-content.ts`)
 * called directly by its own route file, since neither route's real input
 * is "a slug to look up."
 *
 * Returns `null` for a shape this app doesn't recognize (resolves to
 * `not-found` by the caller).
 */
export function matchContentRoute(pathname: string): MatchedContentRoute | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length !== 2) return null;

  const [prefix, slug] = segments;
  if (!slug) return null;

  switch (prefix) {
    case 'blog':
      return { type: 'article', slug };
    case 'category':
      return { type: 'category', slug };
    case 'page':
      return { type: 'page', slug };
    default:
      return null;
  }
}
