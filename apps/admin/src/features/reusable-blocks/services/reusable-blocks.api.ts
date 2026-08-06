import { api, type PaginatedResponse } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type {
  CreateReusableBlockInput,
  ReusableBlock,
  ReusableBlockFilters,
  ReusableBlockUsageReference,
  UpdateReusableBlockInput,
} from '../types/reusable-block';

/** One function per real `ReusableBlocksController` endpoint, verified
 * directly against
 * `apps/backend/src/modules/content-blocks/controllers/reusable-blocks.controller.ts`.
 * No dedicated duplicate endpoint exists — `duplicate` composes `create`
 * from an in-memory source block instead of a new backend route. */
export const reusableBlocksApi = {
  list(filters: ReusableBlockFilters): Promise<PaginatedResponse<ReusableBlock[]>> {
    return api.getPaginated<ReusableBlock[]>(API_ENDPOINTS.CONTENT_BLOCKS.REUSABLE_ROOT, {
      params: filters,
    });
  },

  get(id: string): Promise<ReusableBlock> {
    return api.get<ReusableBlock>(API_ENDPOINTS.CONTENT_BLOCKS.reusableById(id));
  },

  create(input: CreateReusableBlockInput): Promise<ReusableBlock> {
    return api.post<ReusableBlock>(API_ENDPOINTS.CONTENT_BLOCKS.REUSABLE_ROOT, input);
  },

  update(id: string, input: UpdateReusableBlockInput): Promise<ReusableBlock> {
    return api.patch<ReusableBlock>(API_ENDPOINTS.CONTENT_BLOCKS.reusableById(id), input);
  },

  remove(id: string): Promise<ReusableBlock> {
    return api.delete<ReusableBlock>(API_ENDPOINTS.CONTENT_BLOCKS.reusableById(id));
  },

  restore(id: string): Promise<ReusableBlock> {
    return api.post<ReusableBlock>(API_ENDPOINTS.CONTENT_BLOCKS.reusableRestore(id));
  },

  getUsages(id: string): Promise<ReusableBlockUsageReference[]> {
    return api.get<ReusableBlockUsageReference[]>(API_ENDPOINTS.CONTENT_BLOCKS.reusableUsages(id));
  },

  duplicate(source: ReusableBlock, name: string): Promise<ReusableBlock> {
    return reusableBlocksApi.create({
      name,
      blockType: source.blockType,
      data: source.data,
      children: source.children ?? undefined,
      description: source.description ?? undefined,
      category: source.category ?? undefined,
    });
  },
};
