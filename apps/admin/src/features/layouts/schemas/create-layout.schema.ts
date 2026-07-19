import { z } from 'zod';

/** Mirrors `CreateLayoutDto` field-for-field. No `status` field — every
 * created layout starts DRAFT server-side. */
export const createLayoutSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(200, 'Must be 200 characters or fewer.'),
  slug: z.string().max(200, 'Must be 200 characters or fewer.').optional(),
  layoutPreset: z
    .string()
    .min(1, 'Layout preset is required.')
    .max(100, 'Must be 100 characters or fewer.'),
  themeId: z.string().optional(),
});

export type CreateLayoutFormValues = z.infer<typeof createLayoutSchema>;
