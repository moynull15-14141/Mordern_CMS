import { z } from 'zod';

/** Mirrors `UpdateMenuDto` — powers the Edit page's Settings section
 * (Name/Slug/Location/Status), separate from the item tree editor below
 * it (structural item changes save immediately via the reorder endpoint,
 * per `use-menu-item-mutations.ts`; this form has its own explicit Save). */
export const updateMenuSchema = z.object({
  name: z
    .string()
    .min(2, 'Must be at least 2 characters.')
    .max(200, 'Must be 200 characters or fewer.'),
  slug: z.string().max(200, 'Must be 200 characters or fewer.').optional().or(z.literal('')),
  location: z.string().max(100, 'Must be 100 characters or fewer.').optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
});

export type UpdateMenuFormValues = z.infer<typeof updateMenuSchema>;
