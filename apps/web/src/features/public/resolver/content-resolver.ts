import { cache } from 'react';
import type { ResolvedPublicContent } from '../types/content.types';
import { matchContentRoute } from '../utils/route-shape.util';
import { PublicApiError } from '../utils/errors';
import {
  getArticleBySlug,
  getCategoryBySlug,
  getPageBySlug,
} from '../services/content-loader.service';

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
      return { type: 'not-found', path: pathname };
    }
    throw error;
  }
});
