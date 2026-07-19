import { PUBLIC_API_ROUTES } from '../constants/api-routes.constants';
import type {
  PublicArticleContent,
  PublicArticleListItem,
  PublicCategoryContent,
  PublicPageContent,
} from '../types/content.types';
import type { PaginationMeta } from '../types/api-envelope.types';
import { publicFetch, publicFetchPaginated } from './public-fetch.service';

export interface ArticleListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'slug' | 'sortOrder' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

function toQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

/**
 * Content Loader — real implementation (Milestone 13.3). Every function
 * calls the real, verified `Public*Controller` route added in Milestone
 * 13.2 (`docs/75_BACKEND_PUBLIC_CONTENT_API.md`); response shapes mirror
 * `PublicPageResponseDto`/`PublicArticleListItemDto`/
 * `PublicArticleResponseDto`/`PublicCategoryResponseDto` field-for-field
 * (see `types/content.types.ts`). A missing/unpublished slug surfaces as a
 * `PublicApiError` with `status: 404` — callers (the resolver) decide how
 * to turn that into a `not-found` result; this module never swallows it.
 */
export async function getPageBySlug(slug: string): Promise<PublicPageContent> {
  const page = await publicFetch<Omit<PublicPageContent, 'type'>>(
    PUBLIC_API_ROUTES.PAGE_BY_SLUG(slug)
  );
  return { type: 'page', ...page };
}

export async function listArticles(
  params: ArticleListParams = {}
): Promise<{ articles: PublicArticleListItem[]; pagination: PaginationMeta }> {
  const query = toQueryString({
    page: params.page,
    limit: params.limit,
    search: params.search,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });
  const { data, pagination } = await publicFetchPaginated<PublicArticleListItem>(
    `${PUBLIC_API_ROUTES.ARTICLES}${query}`
  );
  return { articles: data, pagination };
}

export async function getArticleBySlug(slug: string): Promise<PublicArticleContent> {
  const article = await publicFetch<Omit<PublicArticleContent, 'type'>>(
    PUBLIC_API_ROUTES.ARTICLE_BY_SLUG(slug)
  );
  return { type: 'article', ...article };
}

export async function listCategories(
  params: CategoryListParams = {}
): Promise<{ categories: PublicCategoryContent[]; pagination: PaginationMeta }> {
  const query = toQueryString({
    page: params.page,
    limit: params.limit,
    search: params.search,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });
  const { data, pagination } = await publicFetchPaginated<Omit<PublicCategoryContent, 'type'>>(
    `${PUBLIC_API_ROUTES.CATEGORIES}${query}`
  );
  return { categories: data.map((category) => ({ type: 'category', ...category })), pagination };
}

export async function getCategoryBySlug(slug: string): Promise<PublicCategoryContent> {
  const category = await publicFetch<Omit<PublicCategoryContent, 'type'>>(
    PUBLIC_API_ROUTES.CATEGORY_BY_SLUG(slug)
  );
  return { type: 'category', ...category };
}
