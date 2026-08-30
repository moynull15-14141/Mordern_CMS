import { api, type PaginatedResponse } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type {
  CreateMenuInput,
  CreateMenuItemInput,
  Menu,
  MenuFilters,
  MenuItem,
  ReorderMenuItemsInput,
  UpdateMenuInput,
  UpdateMenuItemInput,
} from '../types/menu';

/** One function per real `MenusController` endpoint, verified directly
 * against `apps/backend/src/modules/menus/controllers/menus.controller.ts`.
 * Items have no standalone `get`/`list` — they only ever arrive nested
 * inside a `Menu` (`get`/`getBySlug`), matching how the backend itself
 * has no `GET /menus/:id/items` route. */
export const menusApi = {
  list(filters: MenuFilters): Promise<PaginatedResponse<Menu[]>> {
    return api.getPaginated<Menu[]>(API_ENDPOINTS.MENUS.ROOT, { params: filters });
  },

  get(id: string): Promise<Menu> {
    return api.get<Menu>(API_ENDPOINTS.MENUS.byId(id));
  },

  getBySlug(slug: string): Promise<Menu> {
    return api.get<Menu>(API_ENDPOINTS.MENUS.bySlug(slug));
  },

  create(input: CreateMenuInput): Promise<Menu> {
    return api.post<Menu>(API_ENDPOINTS.MENUS.ROOT, input);
  },

  update(id: string, input: UpdateMenuInput): Promise<Menu> {
    return api.patch<Menu>(API_ENDPOINTS.MENUS.byId(id), input);
  },

  remove(id: string): Promise<Menu> {
    return api.delete<Menu>(API_ENDPOINTS.MENUS.byId(id));
  },

  restore(id: string): Promise<Menu> {
    return api.post<Menu>(API_ENDPOINTS.MENUS.restore(id));
  },

  createItem(menuId: string, input: CreateMenuItemInput): Promise<MenuItem> {
    return api.post<MenuItem>(API_ENDPOINTS.MENUS.items(menuId), input);
  },

  updateItem(menuId: string, itemId: string, input: UpdateMenuItemInput): Promise<MenuItem> {
    return api.patch<MenuItem>(API_ENDPOINTS.MENUS.item(menuId, itemId), input);
  },

  removeItem(menuId: string, itemId: string): Promise<MenuItem> {
    return api.delete<MenuItem>(API_ENDPOINTS.MENUS.item(menuId, itemId));
  },

  reorderItems(menuId: string, input: ReorderMenuItemsInput): Promise<Menu> {
    return api.post<Menu>(API_ENDPOINTS.MENUS.reorderItems(menuId), input);
  },
};
