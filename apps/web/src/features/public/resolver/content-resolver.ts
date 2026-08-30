import { cache } from 'react';
import { redirect, permanentRedirect } from 'next/navigation';
import type { ResolvedPublicContent } from '../types/content.types';
import { matchContentRoute } from '../utils/route-shape.util';
import { PublicApiError } from '../utils/errors';
import {
  getArticleBySlug,
  getCategoryBySlug,
  getPageBySlug,
} from '../services/content-loader.service';
import { getRedirectForPath } from '../services/redirects.service';

/**
 * Checked only when normal content resolution is about to return
 * `not-found` — never on a path that already resolves to real content, so
 * a redirect never adds a request to the common case (Step 2 URL/SEO
 * milestone's "Redirects must execute before normal 404 resolution":
 * satisfied by running this immediately before that 404 is returned,
 * rather than as a lookup on every single request).
 *
 * Next.js Server Components can only ever issue a 307 (`redirect()`) or
 * 308 (`permanentRedirect()`) — there is no App Router primitive for a
 * literal 301/302 status without adding `middleware.ts` and its
 * per-request overhead on every route, including ones that already
 * resolve fine. 308/permanent and 307/temporary are the modern-SEO
 * equivalents of 301/302 (Google treats them the same for
 * ranking-transfer purposes) — a deliberate mapping, not a shortcut.
 */
async function redirectIfConfigured(pathname: string): Promise<void> {
  const found = await getRedirectForPath(pathname);
  if (!found) return; // no redirect configured — caller proceeds to a real 404

  if (found.redirectType === 301) {
    permanentRedirect(found.destinationUrl); // throws — Next.js issues a 308
  }
  redirect(found.destinationUrl); // throws — Next.js issues a 307
}

/**
 * ContentResolver — "Given a URL, determine Page / Article / Category /
 * 404" for the three slug-addressed detail routes (`/page/{slug}`,
 * `/blog/{slug}`, `/category/{slug}`). Pure resolution: no JSX, just picks
 * a URL shape (`matchContentRoute`) and delegates to the matching, real
 * Content Loader (`content-loader.service.ts`, wired to the real
 * `Public*Controller` endpoints added in Milestone 13.2).
 *
 * A 404 from the backend (unknown slug, or a slug that exists but isn't
 * published/active — the Public*Service layer treats both identically,
 * see `docs/75_BACKEND_PUBLIC_CONTENT_API.md` "Security Model") resolves
 * to `{ type: 'not-found' }` here, not a thrown error — the Renderer
 * always has something to render. Any other failure (network error, 5xx)
 * propagates so the route's error boundary handles it, since that is a
 * real failure, not "this content doesn't exist."
 *
 * `/` (home) and `/blog` (the list) are resolved by their own dedicated
 * functions (`load-home-content.ts` / `load-blog-list-content.ts`) — see
 * `route-shape.util.ts`'s doc comment for why they don't go through this
 * matcher.
 *
 * Wrapped in React's `cache()` (keyed on the `pathname` string argument) so
 * a route file's `generateMetadata()` and its page component can both call
 * `resolveContent(pathname)` and dedupe to exactly one backend request per
 * render (Performance: "No duplicate API calls") — see
 * `app/blog/[slug]/page.tsx` for the call site.
 */
export const resolveContent = cache(async (pathname: string): Promise<ResolvedPublicContent> => {
  const match = matchContentRoute(pathname);

  if (!match) {
    await redirectIfConfigured(pathname);
    return { type: 'not-found', path: pathname };
  }

  try {
    switch (match.type) {
      case 'page':
        return await getPageBySlug(match.slug);
      case 'article':
        return await getArticleBySlug(match.slug);
      case 'category':
        return await getCategoryBySlug(match.slug);
      default: {
        const exhaustiveCheck: never = match;
        throw new Error(`Unhandled content route type: ${JSON.stringify(exhaustiveCheck)}`);
      }
    }
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      await redirectIfConfigured(pathname);
      return { type: 'not-found', path: pathname };
    }
    throw error;
  }
});
