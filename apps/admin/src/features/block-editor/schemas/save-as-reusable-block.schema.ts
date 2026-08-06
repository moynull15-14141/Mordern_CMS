import { z } from 'zod';

/** Mirrors `CreateReusableBlockDto`'s editorial fields — `blockType`/
 * `data`/`children` come from the selected block itself, not this form. */
export const saveAsReusableBlockSchema = z.object({
  name: z
    .string()
    .min(2, 'Must be at least 2 characters.')
    .max(200, 'Must be 200 characters or fewer.'),
  description: z
    .string()
    .max(2000, 'Must be 2000 characters or fewer.')
    .optional()
    .or(z.literal('')),
  category: z.string().max(100, 'Must be 100 characters or fewer.').optional().or(z.literal('')),
});

export type SaveAsReusableBlockFormValues = z.infer<typeof saveAsReusableBlockSchema>;
