import { cache } from 'react';
import { listArticles } from '../services/content-loader.service';
import type { PublicBlogListContent } from '../types/content.types';

export const BLOG_LIST_PAGE_SIZE = 12;

/**
 * `/blog` list page content — the real input here is the route's
 * `searchParams` (`?page=`/`?search=`), not a slug, which is why this
 * doesn't go through `content-resolver.ts`'s slug matcher (see
 * `route-shape.util.ts`'s doc comment). Calls the real, paginated
 * `GET /public/articles` (Milestone 13.2) with the caller's page/search
 * forwarded — sort is fixed to `publishedAt desc` (a blog's natural
 * default); the milestone brief asked for "server pagination, search
 * params, page navigation," not a sort-order UI.
 *
 * Takes plain string arguments (not a `searchParams` object) so this can
 * be wrapped in React's `cache()`, which memoizes by comparing each
 * argument with `Object.is` — two calls with the same primitive
 * `page`/`search` strings dedupe to one request, letting
 * `app/blog/page.tsx`'s `generateMetadata()` and its page component call
 * this identically without a second round-trip (an object argument
 * wouldn't reliably dedupe the same way across two separate invocations).
 */
export const loadBlogListContent = cache(
  async (page: string | undefined, search: string | undefined): Promise<PublicBlogListContent> => {
    const trimmedSearch = search?.trim() || undefined;
    const requestedPage = Number(page);
    const resolvedPage = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

    const { articles, pagination } = await listArticles({
      page: resolvedPage,
      limit: BLOG_LIST_PAGE_SIZE,
      search: trimmedSearch,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    });

    return {
      type: 'blog-list',
      articles,
      pagination,
      search: trimmedSearch ?? null,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    };
  }
);
