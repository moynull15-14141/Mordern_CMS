import { z } from 'zod';

/**
 * Mirrors `UpdatePreferencesDto` exactly
 * (apps/backend/src/modules/users/dto/update-preferences.dto.ts).
 * `editorPreference`/`dashboardPreference`/`accessibilityPreference` are
 * validated only as "plain object" by the backend (`UsersValidator`) — kept
 * as opaque `Record<string, unknown>` here since no closed shape exists to
 * mirror, per docs/59 "never invent" (no frontend form edits these raw
 * JSON blobs in this milestone; they pass through untouched if present).
 */
export const updatePreferencesSchema = z.object({
  theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']).optional(),
  language: z.string().optional().or(z.literal('')),
  timezone: z.string().optional().or(z.literal('')),
  notificationPreference: z
    .object({
      email: z.boolean().optional(),
      inApp: z.boolean().optional(),
    })
    .optional(),
});

export type UpdatePreferencesFormValues = z.infer<typeof updatePreferencesSchema>;
