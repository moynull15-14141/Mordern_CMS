import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';
import {
  listPages,
  listArticles,
  listCategories,
} from '@/features/public/services/content-loader.service';

/** A large single-page fetch rather than looping through pagination — the
 * backend's list endpoints don't enforce a hard `limit` ceiling (see the
 * Step 2 URL/SEO milestone's Phase 0 audit). Fine for a site with up to a
 * few thousand items of one type; scaling further only requires splitting
 * this one file into `sitemap-pages.xml`/`sitemap-articles.xml`/etc. (a
 * Next.js "sitemap index" — see this file's own doc comment) without
 * touching how each entry is built. Not implemented now — no site this
 * size exists yet, and building it speculatively would be over-engineering
 * a V1 sitemap. */
const MAX_ENTRIES_PER_TYPE = 5000;

/**
 * `/sitemap.xml` — Next.js's native file-convention route. Enumerates
 * every published, indexable Page/Article/Category via the real public
 * list endpoints (`GET /public/pages`, `/public/articles`, `/public/categories`
 * — the first of these three, `/public/pages`, was added by this
 * milestone specifically because nothing could previously enumerate all
 * published pages). Each already excludes drafts/archived/deleted content
 * server-side (`status: PUBLISHED` forced in every `Public*Service`); this
 * file additionally excludes anything explicitly marked `noIndex`.
 *
 * If a site ever needs `/sitemap.xml` to itself become a *sitemap index*
 * pointing at `/sitemap-pages.xml`/`/sitemap-articles.xml`/etc. (Next.js
 * supports this via a `generateSitemaps()` export from this same file),
 * that's a change local to this one file — nothing about how entries are
 * built above needs to move.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pagesResult, articlesResult, categoriesResult] = await Promise.all([
    listPages({ limit: MAX_ENTRIES_PER_TYPE }),
    listArticles({ limit: MAX_ENTRIES_PER_TYPE }),
    listCategories({ limit: MAX_ENTRIES_PER_TYPE }),
  ]);

  const pageEntries: MetadataRoute.Sitemap = pagesResult.pages
    .filter((page) => !page.noIndex)
    .map((page) => ({
      url: `${env.SITE_URL}/page/${page.slug}`,
      lastModified: page.updatedAt,
    }));

  const articleEntries: MetadataRoute.Sitemap = articlesResult.articles
    .filter((article) => !article.noIndex)
    .map((article) => ({
      url: `${env.SITE_URL}/blog/${article.slug}`,
      lastModified: article.updatedAt ?? article.publishedAt ?? undefined,
    }));

  const categoryEntries: MetadataRoute.Sitemap = categoriesResult.categories
    .filter((category) => category.seo?.robots?.index !== false)
    .map((category) => ({
      url: `${env.SITE_URL}/category/${category.slug}`,
      lastModified: category.updatedAt,
    }));

  return [
    { url: env.SITE_URL, lastModified: new Date().toISOString() },
    { url: `${env.SITE_URL}/blog`, lastModified: new Date().toISOString() },
    ...pageEntries,
    ...articleEntries,
    ...categoryEntries,
  ];
}
