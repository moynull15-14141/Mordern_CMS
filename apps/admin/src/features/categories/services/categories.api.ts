import { api, type PaginatedResponse } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type {
  Category,
  CategoryBreadcrumbItem,
  CategoryFilters,
  CategoryTreeNode,
  CreateCategoryInput,
  MoveCategoryInput,
  UpdateCategoryInput,
} from '../types/category';

/** One function per real `CategoriesController` endpoint, verified
 * directly against
 * `apps/backend/src/modules/categories/controllers/categories.controller.ts`.
 * No bulk endpoint exists. `update()` never accepts `parentId` — parent
 * changes go through `move()` (`POST /:id/move`) exclusively, matching the
 * backend's own `PATCH`/`POST /move` split. */
export const categoriesApi = {
  list(filters: CategoryFilters): Promise<PaginatedResponse<Category[]>> {
    return api.getPaginated<Category[]>(API_ENDPOINTS.CATEGORIES.ROOT, { params: filters });
  },

  getTree(): Promise<CategoryTreeNode[]> {
    return api.get<CategoryTreeNode[]>(API_ENDPOINTS.CATEGORIES.TREE);
  },

  getFlat(): Promise<Category[]> {
    return api.get<Category[]>(API_ENDPOINTS.CATEGORIES.FLAT);
  },

  getBySlug(slug: string): Promise<Category> {
    return api.get<Category>(API_ENDPOINTS.CATEGORIES.bySlug(slug));
  },

  get(id: string): Promise<Category> {
    return api.get<Category>(API_ENDPOINTS.CATEGORIES.byId(id));
  },

  getChildren(id: string): Promise<Category[]> {
    return api.get<Category[]>(API_ENDPOINTS.CATEGORIES.children(id));
  },

  getDescendants(id: string): Promise<Category[]> {
    return api.get<Category[]>(API_ENDPOINTS.CATEGORIES.descendants(id));
  },

  getAncestors(id: string): Promise<Category[]> {
    return api.get<Category[]>(API_ENDPOINTS.CATEGORIES.ancestors(id));
  },

  getBreadcrumb(id: string): Promise<CategoryBreadcrumbItem[]> {
    return api.get<CategoryBreadcrumbItem[]>(API_ENDPOINTS.CATEGORIES.breadcrumb(id));
  },

  create(input: CreateCategoryInput): Promise<Category> {
    return api.post<Category>(API_ENDPOINTS.CATEGORIES.ROOT, input);
  },

  update(id: string, input: UpdateCategoryInput): Promise<Category> {
    return api.patch<Category>(API_ENDPOINTS.CATEGORIES.byId(id), input);
  },

  move(id: string, input: MoveCategoryInput): Promise<Category> {
    return api.post<Category>(API_ENDPOINTS.CATEGORIES.move(id), input);
  },

  remove(id: string): Promise<Category> {
    return api.delete<Category>(API_ENDPOINTS.CATEGORIES.byId(id));
  },

  restore(id: string): Promise<Category> {
    return api.post<Category>(API_ENDPOINTS.CATEGORIES.restore(id));
  },
};
