import { z } from 'zod';

/** Mirrors `CreatePatternDto`'s editorial fields — `body` (the captured
 * selected block) comes from the editor selection itself, not this form. */
export const saveAsPatternSchema = z.object({
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
  tags: z.string().max(500, 'Must be 500 characters or fewer.').optional().or(z.literal('')),
});

export type SaveAsPatternFormValues = z.infer<typeof saveAsPatternSchema>;
