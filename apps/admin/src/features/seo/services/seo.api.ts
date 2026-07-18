import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type {
  CreateSeoInput,
  SeoMeta,
  SeoPreviewInput,
  SeoPreviewResult,
  SeoValidateInput,
  SeoValidationResult,
  UpdateSeoInput,
  UpsertSeoInput,
} from '../types/seo';

/** One function per real `SeoController` endpoint, verified directly
 * against `apps/backend/src/modules/seo/controllers/seo.controller.ts`.
 * No bulk endpoint, no list endpoint exists — only lookup by id/article/
 * category. */
export const seoApi = {
  get(id: string): Promise<SeoMeta> {
    return api.get<SeoMeta>(API_ENDPOINTS.SEO.byId(id));
  },

  getForArticle(articleId: string): Promise<SeoMeta> {
    return api.get<SeoMeta>(API_ENDPOINTS.SEO.byArticle(articleId));
  },

  getForCategory(categoryId: string): Promise<SeoMeta> {
    return api.get<SeoMeta>(API_ENDPOINTS.SEO.byCategory(categoryId));
  },

  create(input: CreateSeoInput): Promise<SeoMeta> {
    return api.post<SeoMeta>(API_ENDPOINTS.SEO.ROOT, input);
  },

  update(id: string, input: UpdateSeoInput): Promise<SeoMeta> {
    return api.patch<SeoMeta>(API_ENDPOINTS.SEO.byId(id), input);
  },

  upsert(input: UpsertSeoInput): Promise<SeoMeta> {
    return api.post<SeoMeta>(API_ENDPOINTS.SEO.UPSERT, input);
  },

  remove(id: string): Promise<SeoMeta> {
    return api.delete<SeoMeta>(API_ENDPOINTS.SEO.byId(id));
  },

  restore(id: string): Promise<SeoMeta> {
    return api.post<SeoMeta>(API_ENDPOINTS.SEO.restore(id));
  },

  preview(input: SeoPreviewInput): Promise<SeoPreviewResult> {
    return api.post<SeoPreviewResult>(API_ENDPOINTS.SEO.PREVIEW, input);
  },

  validate(input: SeoValidateInput): Promise<SeoValidationResult> {
    return api.post<SeoValidationResult>(API_ENDPOINTS.SEO.VALIDATE, input);
  },
};
