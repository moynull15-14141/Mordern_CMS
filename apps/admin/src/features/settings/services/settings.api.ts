import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import type { BulkUpdateInput, ResetResult, Setting, SettingCategory, UpdateSettingInput } from '../types/settings';

/**
 * One function per real `SettingsController` endpoint — verified directly
 * against `apps/backend/src/modules/settings/controllers/settings.controller.ts`,
 * not assumed. No `create`/`delete` function exists — no such capability
 * exists on the backend (settings are a closed, fixed catalog; see
 * docs/64_FRONTEND_SETTINGS.md "Conflicts Discovered"). `import`/`export`
 * are real endpoints, deliberately not wired here — out of this
 * milestone's requested scope.
 *
 * Updates use `PUT`, not `PATCH` — confirmed intentional
 * (docs/39_SETTINGS_ARCHITECTURE.md "PUT vs PATCH"), not a mistake to fix.
 */
export const settingsApi = {
  getAll(): Promise<Setting[]> {
    return api.get<Setting[]>(API_ENDPOINTS.SETTINGS.ROOT);
  },

  getByCategory(category: SettingCategory): Promise<Setting[]> {
    return api.get<Setting[]>(API_ENDPOINTS.SETTINGS.byCategory(category));
  },

  getByKey(key: string): Promise<Setting> {
    return api.get<Setting>(API_ENDPOINTS.SETTINGS.byKey(key));
  },

  updateSetting(key: string, input: UpdateSettingInput): Promise<Setting> {
    return api.put<Setting>(API_ENDPOINTS.SETTINGS.byKey(key), input);
  },

  bulkUpdateCategory(category: SettingCategory, input: BulkUpdateInput): Promise<Setting[]> {
    return api.put<Setting[]>(API_ENDPOINTS.SETTINGS.byCategory(category), input);
  },

  resetCategory(category: SettingCategory): Promise<ResetResult> {
    return api.post<ResetResult>(API_ENDPOINTS.SETTINGS.RESET_CATEGORY, { category });
  },

  resetAll(): Promise<ResetResult> {
    return api.post<ResetResult>(API_ENDPOINTS.SETTINGS.RESET);
  },
};
