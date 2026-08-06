import { z } from 'zod';
import { blockTreeSchema } from '@/features/block-editor';

/** Mirrors `CreateReusableBlockDto` field-for-field. The Block Editor is
 * embedded as a single controlled field (`blocks`) constrained to exactly
 * one top-level block — a reusable block always wraps one block (with its
 * own nested children, for a container type), never a whole page. */
export const createReusableBlockSchema = z.object({
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
  blocks: blockTreeSchema
    .min(1, 'Add a block to save as reusable.')
    .max(1, 'Only one top-level block is allowed for a reusable block.'),
});

export type CreateReusableBlockFormValues = z.infer<typeof createReusableBlockSchema>;
