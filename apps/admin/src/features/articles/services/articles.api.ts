import { api, type PaginatedResponse } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type {
  Article,
  ArticleFilters,
  ArticleRevision,
  ArticleRevisionCompare,
  CreateArticleInput,
  ScheduleArticleInput,
  UpdateArticleInput,
} from '../types/article';

/** One function per real `ArticlesController` endpoint, verified directly
 * against `apps/backend/src/modules/articles/controllers/articles.controller.ts`.
 * No bulk endpoint exists. */
export const articlesApi = {
  list(filters: ArticleFilters): Promise<PaginatedResponse<Article[]>> {
    return api.getPaginated<Article[]>(API_ENDPOINTS.ARTICLES.ROOT, { params: filters });
  },

  get(id: string): Promise<Article> {
    return api.get<Article>(API_ENDPOINTS.ARTICLES.byId(id));
  },

  getBySlug(slug: string): Promise<Article> {
    return api.get<Article>(API_ENDPOINTS.ARTICLES.bySlug(slug));
  },

  create(input: CreateArticleInput): Promise<Article> {
    return api.post<Article>(API_ENDPOINTS.ARTICLES.ROOT, input);
  },

  update(id: string, input: UpdateArticleInput): Promise<Article> {
    return api.patch<Article>(API_ENDPOINTS.ARTICLES.byId(id), input);
  },

  remove(id: string): Promise<Article> {
    return api.delete<Article>(API_ENDPOINTS.ARTICLES.byId(id));
  },

  restore(id: string): Promise<Article> {
    return api.post<Article>(API_ENDPOINTS.ARTICLES.restore(id));
  },

  publish(id: string): Promise<Article> {
    return api.post<Article>(API_ENDPOINTS.ARTICLES.publish(id));
  },

  schedule(id: string, input: ScheduleArticleInput): Promise<Article> {
    return api.post<Article>(API_ENDPOINTS.ARTICLES.schedule(id), input);
  },

  listRevisions(id: string): Promise<ArticleRevision[]> {
    return api.get<ArticleRevision[]>(API_ENDPOINTS.ARTICLES.revisions(id));
  },

  compareRevisions(id: string, from: number, to: number): Promise<ArticleRevisionCompare> {
    return api.get<ArticleRevisionCompare>(API_ENDPOINTS.ARTICLES.revisionsCompare(id), {
      params: { from, to },
    });
  },

  restoreRevision(id: string, version: number): Promise<Article> {
    return api.post<Article>(API_ENDPOINTS.ARTICLES.restoreRevision(id, version));
  },
};
