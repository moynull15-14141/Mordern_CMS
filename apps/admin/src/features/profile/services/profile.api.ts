import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { MessageResponse } from '@/types/api';
import type { ChangePasswordInput, UpdatePreferencesInput, UpdateProfileInput, User } from '@/features/users';

/**
 * Self-service actions only — `/users/me*` plus `POST /users/:id/change-password`
 * (inherently self-service: requires the caller's own current password,
 * enforced by the controller's own `id === currentUser.id` check). Split
 * from `features/users/services/users.api.ts` per approved decision 9
 * ("One users.api.ts, One profile.api.ts"), mirroring the backend's own
 * admin/self-service boundary (docs/42_USER_MANAGEMENT_ARCHITECTURE.md
 * "Permission Conflict"). No `updateMyAvatar` (set) function — no
 * MediaAsset picker exists to source an id from (approved decision 3);
 * `removeMyAvatar` needs no picker, so it is implemented.
 */
export const profileApi = {
  getMe(): Promise<User> {
    return api.get<User>(API_ENDPOINTS.USERS.ME);
  },

  updateProfile(input: UpdateProfileInput): Promise<User> {
    return api.patch<User>(API_ENDPOINTS.USERS.ME_PROFILE, input);
  },

  updatePreferences(input: UpdatePreferencesInput): Promise<User> {
    return api.patch<User>(API_ENDPOINTS.USERS.ME_PREFERENCES, input);
  },

  removeAvatar(): Promise<User> {
    return api.delete<User>(API_ENDPOINTS.USERS.ME_AVATAR);
  },

  changePassword(userId: string, input: ChangePasswordInput): Promise<MessageResponse> {
    return api.post<MessageResponse>(API_ENDPOINTS.USERS.changePassword(userId), input);
  },
};
