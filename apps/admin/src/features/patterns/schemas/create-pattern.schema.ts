import { z } from 'zod';
import { blockTreeSchema } from '@/features/block-editor';

/** Mirrors `CreatePatternDto` field-for-field. Unlike a reusable block's
 * `.min(1).max(1)`, a Pattern's `blocks` has no upper bound — a "section"
 * is naturally one or more sibling blocks (Hero, Features, CTA...), not a
 * single wrapped block. `tags` is edited as a comma-separated string in
 * the form, split into `string[]` at the DTO boundary. */
export const createPatternSchema = z.object({
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
  tags: z.string().max(1000, 'Must be 1000 characters or fewer.').optional().or(z.literal('')),
  blocks: blockTreeSchema.min(1, 'Add at least one block to save this pattern.'),
});

export type CreatePatternFormValues = z.infer<typeof createPatternSchema>;
