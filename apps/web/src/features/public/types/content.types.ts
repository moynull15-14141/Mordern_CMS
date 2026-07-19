import type { PaginationMeta } from './api-envelope.types';
import type { PublicSeo } from './seo.types';

/**
 * Content shapes mirror the real, verified backend Public DTOs
 * field-for-field:
 * `PublicPageResponseDto` (`apps/backend/src/modules/pages/dto/public-page-response.dto.ts`),
 * `PublicArticleListItemDto`/`PublicArticleResponseDto`
 * (`apps/backend/src/modules/articles/dto/public-article-response.dto.ts`),
 * `PublicCategoryResponseDto`
 * (`apps/backend/src/modules/categories/dto/public-category-response.dto.ts`).
 * None of these expose `id` or `status` — Milestone 13.2 deliberately
 * omitted both (a slug addresses the content; status is always a fixed
 * allowed value by construction) — so neither appears here either.
 */

export interface PublicPageContent {
  type: 'page';
  title: string;
  slug: string;
  /** Opaque JSON document (`Page.body`) — rendering its structure into
   * HTML is Block/Rich-Content Engine work, explicitly out of scope for
   * this milestone. Renderer treats this as an inert value. */
  body: unknown;
  publishedAt: string | null;
  seo: PublicSeo | null;
}

export interface PublicArticleAuthor {
  penName: string;
}

export interface PublicArticleCategory {
  name: string;
  slug: string;
}

export interface PublicArticleTag {
  name: string;
  slug: string;
  primary: boolean;
}

/** Mirrors `PublicArticleListItemDto` — the shape `GET /public/articles`
 * returns per item (no `body`/`seo` — see that DTO's doc comment). */
export interface PublicArticleListItem {
  title: string;
  subtitle: string | null;
  slug: string;
  summary: string | null;
  publishedAt: string | null;
  readingTime: number | null;
  author: PublicArticleAuthor;
  category: PublicArticleCategory | null;
  tags: PublicArticleTag[];
}

/** Mirrors `PublicArticleResponseDto` — `GET /public/articles/slug/:slug`'s
 * detail shape (list fields + body/wordCount/language/locale/canonicalUrl/seo). */
export interface PublicArticleContent extends PublicArticleListItem {
  type: 'article';
  body: unknown;
  wordCount: number | null;
  language: string;
  locale: string;
  canonicalUrl: string | null;
  seo: PublicSeo | null;
}

/** Mirrors `PublicCategoryResponseDto`. No public category-tree feature
 * exists yet (Milestone 13.2 "Known Limitations") — no `parentId`. */
export interface PublicCategoryContent {
  type: 'category';
  name: string;
  slug: string;
  description: string | null;
  articleCount: number;
  seo: PublicSeo | null;
}

/**
 * Home page composition data — sourced entirely from real, existing list
 * endpoints (no dedicated "homepage" backend endpoint exists, and none is
 * invented here). See `resolver/load-home-content.ts` for exactly which
 * calls populate `latestArticles`/`featuredArticles`/`categories`, and
 * `docs/76_FRONTEND_PUBLIC_WEBSITE.md` "Known Limitations" for why
 * `featuredArticles` is not a distinct backend concept.
 */
export interface PublicHomeContent {
  type: 'home';
  latestArticles: PublicArticleListItem[];
  featuredArticles: PublicArticleListItem[];
  categories: PublicCategoryContent[];
}

/** `/blog` list page data — one page of `GET /public/articles`, plus the
 * request's own search/sort state (for building the search form and
 * pagination links without a second round-trip). */
export interface PublicBlogListContent {
  type: 'blog-list';
  articles: PublicArticleListItem[];
  pagination: PaginationMeta;
  search: string | null;
  sortBy: string;
  sortOrder: string;
}

/** Resolved when a URL matches no known route shape, or the matched
 * content doesn't exist/isn't published (a real 404 from the backend). */
export interface PublicNotFoundContent {
  type: 'not-found';
  path: string;
}

export type ResolvedPublicContent =
  | PublicPageContent
  | PublicArticleContent
  | PublicCategoryContent
  | PublicHomeContent
  | PublicBlogListContent
  | PublicNotFoundContent;

export type PublicContentType = ResolvedPublicContent['type'];
