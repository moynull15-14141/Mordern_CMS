import { cache } from 'react';
import { PUBLIC_API_ROUTES } from '../constants/api-routes.constants';
import type { PublicSeo } from '../types/seo.types';
import { publicFetch } from './public-fetch.service';

/**
 * Real endpoint: `GET /public/seo/:entity/:slug`
 * (`apps/backend/src/modules/seo/controllers/public-seo.controller.ts`,
 * Milestone 13.2) — real, verified, and wired here exactly as the
 * milestone brief asks ("SEO: Use GET /public/seo").
 *
 * **Not called by any shipped route in this milestone.** Every route that
 * needs SEO data (`/page/[slug]`, `/blog/[slug]`, `/category/[slug]`)
 * already fetches the full entity via `content-loader.service.ts`, and
 * `PublicPageResponseDto`/`PublicArticleResponseDto`/`PublicCategoryResponseDto`
 * all embed an equivalent `seo` object on that same response (Milestone
 * 13.2's mappers). Calling this endpoint too, for content already in hand,
 * would be exactly the duplicate request the brief's own Performance
 * section forbids ("No duplicate API calls"). This function is kept real
 * and tested for a genuine future case: SEO data needed *without* also
 * needing the full entity (e.g. a sitemap/meta-only batch job) — see
 * docs/76_FRONTEND_PUBLIC_WEBSITE.md "SEO".
 */
export const getSeoForEntity = cache(
  async (entity: 'page' | 'article' | 'category', slug: string): Promise<PublicSeo> => {
    return publicFetch<PublicSeo>(PUBLIC_API_ROUTES.SEO(entity, slug));
  }
);
