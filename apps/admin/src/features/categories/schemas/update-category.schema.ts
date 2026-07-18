import { z } from 'zod';
import { categorySeoSchema } from './category-seo.schema';

/** Mirrors `UpdateCategoryDto` (PATCH semantics). No `parentId` — parent
 * changes go through the dedicated `move-category.schema.ts` form instead. */
export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required.').max(150, 'Must be 150 characters or fewer.'),
  slug: z.string().max(200, 'Must be 200 characters or fewer.').optional(),
  description: z.string().max(1000, 'Must be 1000 characters or fewer.').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  sortOrder: z.union([z.literal(''), z.coerce.number().int()]).optional(),
  seo: categorySeoSchema.optional(),
});

export type UpdateCategoryFormValues = z.infer<typeof updateCategorySchema>;
