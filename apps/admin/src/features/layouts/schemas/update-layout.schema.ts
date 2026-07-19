import { z } from 'zod';

/** Mirrors `UpdateLayoutDto` — PATCH semantics, every field present in the
 * form (unlike the DTO's own all-optional shape) since the Edit form
 * always submits the full current state. */
export const updateLayoutSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(200, 'Must be 200 characters or fewer.'),
  slug: z.string().min(1, 'Slug is required.').max(200, 'Must be 200 characters or fewer.'),
  layoutPreset: z
    .string()
    .min(1, 'Layout preset is required.')
    .max(100, 'Must be 100 characters or fewer.'),
  themeId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
});

export type UpdateLayoutFormValues = z.infer<typeof updateLayoutSchema>;
