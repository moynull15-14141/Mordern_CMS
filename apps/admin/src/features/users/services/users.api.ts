import { api, type PaginatedResponse } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { MessageResponse } from '@/types/api';
import type { AdminResetPasswordInput, CreateUserInput, UpdateUserInput, User, UserFilters } from '../types/user';

/**
 * Admin-only Users CRUD — one function per real `UsersController` endpoint
 * gated by `users.manage`, verified directly against
 * `apps/backend/src/modules/users/controllers/users.controller.ts`. Every
 * self-service `/users/me*` and `/users/:id/change-password` call lives in
 * `features/profile/services/profile.api.ts` instead (a separate file per
 * approved decision 9's own "One users.api.ts, One profile.api.ts"
 * split — self-service vs. admin action, mirroring the backend's own
 * `docs/42_USER_MANAGEMENT_ARCHITECTURE.md` "Permission Conflict" split).
 * No function exists for role assignment, avatar upload, or `/users/profile`
 * — those endpoints don't exist (docs/63_FRONTEND_USERS.md "API Mapping").
 */
export const usersApi = {
  list(filters: UserFilters): Promise<PaginatedResponse<User[]>> {
    return api.getPaginated<User[]>(API_ENDPOINTS.USERS.ROOT, { params: filters });
  },

  get(id: string): Promise<User> {
    return api.get<User>(API_ENDPOINTS.USERS.byId(id));
  },

  create(input: CreateUserInput): Promise<User> {
    return api.post<User>(API_ENDPOINTS.USERS.ROOT, input);
  },

  update(id: string, input: UpdateUserInput): Promise<User> {
    return api.patch<User>(API_ENDPOINTS.USERS.byId(id), input);
  },

  remove(id: string): Promise<User> {
    return api.delete<User>(API_ENDPOINTS.USERS.byId(id));
  },

  restore(id: string): Promise<User> {
    return api.post<User>(API_ENDPOINTS.USERS.restore(id));
  },

  resetPassword(id: string, input: AdminResetPasswordInput): Promise<MessageResponse> {
    return api.post<MessageResponse>(API_ENDPOINTS.USERS.resetPassword(id), input);
  },
};
