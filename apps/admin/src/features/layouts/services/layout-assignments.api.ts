import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type {
  AssignLayoutInput,
  LayoutAssignment,
  LayoutAssignmentContentType,
} from '../types/layout-assignment';

/** One function per real `LayoutAssignmentsController` endpoint, verified
 * directly against
 * `apps/backend/src/modules/layouts/controllers/layout-assignments.controller.ts`.
 * `list` is a plain array — no pagination on this endpoint (assignment
 * counts per site are expected to stay small; verified against the real
 * controller, which returns `LayoutAssignmentResponseDto[]` directly, not
 * a `PaginatedResult`). */
export const layoutAssignmentsApi = {
  list(contentType?: LayoutAssignmentContentType): Promise<LayoutAssignment[]> {
    return api.get<LayoutAssignment[]>(API_ENDPOINTS.LAYOUT_ASSIGNMENTS.ROOT, {
      params: contentType ? { contentType } : undefined,
    });
  },

  get(id: string): Promise<LayoutAssignment> {
    return api.get<LayoutAssignment>(API_ENDPOINTS.LAYOUT_ASSIGNMENTS.byId(id));
  },

  /** `POST /layout-assignments` — upsert; see `AssignLayoutInput`'s doc
   * comment. */
  assign(input: AssignLayoutInput): Promise<LayoutAssignment> {
    return api.post<LayoutAssignment>(API_ENDPOINTS.LAYOUT_ASSIGNMENTS.ROOT, input);
  },

  /** `DELETE /layout-assignments/:id` — soft delete ("unassign"). */
  unassign(id: string): Promise<LayoutAssignment> {
    return api.delete<LayoutAssignment>(API_ENDPOINTS.LAYOUT_ASSIGNMENTS.byId(id));
  },

  restore(id: string): Promise<LayoutAssignment> {
    return api.post<LayoutAssignment>(API_ENDPOINTS.LAYOUT_ASSIGNMENTS.restore(id));
  },
};
