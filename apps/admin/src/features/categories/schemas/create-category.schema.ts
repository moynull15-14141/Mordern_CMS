import { z } from 'zod';
import { categorySeoSchema } from './category-seo.schema';

/** Mirrors `CreateCategoryDto` field-for-field. No `status` field exists —
 * a newly created category starts in the backend's own default status. */
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required.').max(150, 'Must be 150 characters or fewer.'),
  slug: z.string().max(200, 'Must be 200 characters or fewer.').optional(),
  description: z.string().max(1000, 'Must be 1000 characters or fewer.').optional(),
  parentId: z.union([z.literal(''), z.string().uuid()]).optional(),
  sortOrder: z.union([z.literal(''), z.coerce.number().int()]).optional(),
  seo: categorySeoSchema.optional(),
});

export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;
