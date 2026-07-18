import { z } from 'zod';

/** Mirrors `UpdateTagDto` (PATCH semantics). Same `synonyms` comma-text
 * substitution as `create-tag.schema.ts`. */
export const updateTagSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(100, 'Must be 100 characters or fewer.'),
  slug: z.string().max(200, 'Must be 200 characters or fewer.').optional(),
  description: z.string().max(1000, 'Must be 1000 characters or fewer.').optional(),
  synonyms: z.string().optional(),
});

export type UpdateTagFormValues = z.infer<typeof updateTagSchema>;
