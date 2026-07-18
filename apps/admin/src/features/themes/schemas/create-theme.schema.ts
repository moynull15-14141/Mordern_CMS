import { z } from 'zod';
import { themeSettingsSchema } from './theme-settings.schema';

/** Mirrors `CreateThemeDto` field-for-field. No `status`/`isActive` field
 * — every created theme starts DRAFT and inactive server-side. */
export const createThemeSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(200, 'Must be 200 characters or fewer.'),
  slug: z.string().max(200, 'Must be 200 characters or fewer.').optional(),
  version: z.string().max(50, 'Must be 50 characters or fewer.').optional(),
  author: z.string().max(200, 'Must be 200 characters or fewer.').optional(),
  description: z.string().max(2000, 'Must be 2000 characters or fewer.').optional(),
  thumbnail: z.string().max(2000, 'Must be 2000 characters or fewer.').optional(),
  settings: themeSettingsSchema.optional(),
});

export type CreateThemeFormValues = z.infer<typeof createThemeSchema>;
