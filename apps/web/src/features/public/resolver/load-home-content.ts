import { cache } from 'react';
import { listArticles, listCategories } from '../services/content-loader.service';
import type { PublicHomeContent } from '../types/content.types';

const LATEST_ARTICLES_LIMIT = 6;
const FEATURED_ARTICLES_LIMIT = 3;
const HIGHLIGHT_CATEGORIES_LIMIT = 6;

/**
 * Home page content — composed entirely from real, existing list endpoints
 * (`GET /public/articles`, `GET /public/categories`). No dedicated
 * "homepage" endpoint exists, and none is invented here (Rule Zero); this
 * is pure composition over data that's already real.
 *
 * `featuredArticles` is NOT a distinct backend concept — there is no
 * `Article.isFeatured` field or any other signal to distinguish "featured"
 * from "not featured" anywhere in the schema or the Public Articles API
 * (verified: `PublicArticleQueryDto`/`ArticleSortField` have no such
 * option). Rather than inventing one, this section shows the *next* page
 * of the same real, chronologically-sorted article list "Latest Articles"
 * already shows page 1 of — see docs/76_FRONTEND_PUBLIC_WEBSITE.md "Known
 * Limitations" for the full reasoning and what a real Featured Articles
 * feature would need (e.g. an `Article.isFeatured` column or a homepage
 * curation table).
 *
 * Wrapped in React's `cache()` (no arguments — one Home render, one
 * result) so `app/page.tsx`'s `generateMetadata()` and its page component
 * dedupe to one set of requests, same reasoning as
 * `content-resolver.ts`'s `resolveContent`.
 */
export const loadHomeContent = cache(async (): Promise<PublicHomeContent> => {
  const [latest, featured, categories] = await Promise.all([
    listArticles({
      page: 1,
      limit: LATEST_ARTICLES_LIMIT,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    }),
    listArticles({
      page: 2,
      limit: FEATURED_ARTICLES_LIMIT,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    }),
    listCategories({
      page: 1,
      limit: HIGHLIGHT_CATEGORIES_LIMIT,
      sortBy: 'sortOrder',
      sortOrder: 'asc',
    }),
  ]);

  return {
    type: 'home',
    latestArticles: latest.articles,
    featuredArticles: featured.articles,
    categories: categories.categories,
  };
});
