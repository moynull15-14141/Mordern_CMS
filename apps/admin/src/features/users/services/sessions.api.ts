import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { MessageResponse } from '@/types/api';
import type { UserSession } from '../types/user';

/**
 * Session management is admin-only in the real backend — there is no
 * `/users/me/sessions` (docs/63_FRONTEND_USERS.md "Sessions"). Every
 * function here requires `users.manage` server-side, same as the page that
 * calls them (`/users/:id`). Not paginated — `GET /users/:id/sessions`
 * returns a plain array (a user's live session count is small), matching
 * `53_API_FREEZE.md`'s bounded-list exception.
 */
export const sessionsApi = {
  list(userId: string): Promise<UserSession[]> {
    return api.get<UserSession[]>(API_ENDPOINTS.USERS.sessions(userId));
  },

  terminate(userId: string, sessionId: string): Promise<MessageResponse> {
    return api.delete<MessageResponse>(API_ENDPOINTS.USERS.session(userId, sessionId));
  },

  terminateAll(userId: string): Promise<MessageResponse> {
    return api.delete<MessageResponse>(API_ENDPOINTS.USERS.sessions(userId));
  },
};
