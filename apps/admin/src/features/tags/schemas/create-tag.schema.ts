import { z } from 'zod';

/** Mirrors `CreateTagDto` field-for-field. `synonyms` is `string[]` on the
 * DTO but edited here as one comma-separated text field, split into the
 * real array shape only at the page component's submit handler (same
 * "form-field string, domain-shape at the boundary" pattern used for
 * `ArticleSeoDto.keywords` in Frontend Milestone 5). No `color` field —
 * the frozen `Tag` model has no such column. */
export const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(100, 'Must be 100 characters or fewer.'),
  slug: z.string().max(200, 'Must be 200 characters or fewer.').optional(),
  description: z.string().max(1000, 'Must be 1000 characters or fewer.').optional(),
  synonyms: z.string().optional(),
});

export type CreateTagFormValues = z.infer<typeof createTagSchema>;
