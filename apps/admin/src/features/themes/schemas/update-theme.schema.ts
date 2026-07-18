import { z } from 'zod';
import { themeSettingsSchema } from './theme-settings.schema';

/** Mirrors `UpdateThemeDto` (PATCH semantics). `status` accepts any real
 * `ThemeStatus` value directly (the backend has no dedicated-endpoint-only
 * restriction for Theme status, unlike Pages/Articles' PUBLISHED split —
 * see docs/72_BACKEND_THEMES.md "Known Limitations"). No `isActive` field
 * — that only ever changes via the dedicated Activate action. */
export const updateThemeSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(200, 'Must be 200 characters or fewer.'),
  slug: z.string().max(200, 'Must be 200 characters or fewer.').optional(),
  version: z.string().max(50, 'Must be 50 characters or fewer.').optional(),
  author: z.string().max(200, 'Must be 200 characters or fewer.').optional(),
  description: z.string().max(2000, 'Must be 2000 characters or fewer.').optional(),
  thumbnail: z.string().max(2000, 'Must be 2000 characters or fewer.').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  settings: themeSettingsSchema.optional(),
});

export type UpdateThemeFormValues = z.infer<typeof updateThemeSchema>;
