import { z } from 'zod';

/** Mirrors `CreateMenuDto` field-for-field. `location` is deliberately a
 * plain optional string, not an enum — the backend column itself is
 * open-ended (§A.4); the create form offers the known locations as
 * one-click suggestions instead of constraining the schema. */
export const createMenuSchema = z.object({
  name: z
    .string()
    .min(2, 'Must be at least 2 characters.')
    .max(200, 'Must be 200 characters or fewer.'),
  slug: z.string().max(200, 'Must be 200 characters or fewer.').optional().or(z.literal('')),
  location: z.string().max(100, 'Must be 100 characters or fewer.').optional().or(z.literal('')),
});

export type CreateMenuFormValues = z.infer<typeof createMenuSchema>;
