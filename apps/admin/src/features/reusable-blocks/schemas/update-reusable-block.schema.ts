import { z } from 'zod';
import { blockTreeSchema } from '@/features/block-editor';

/** Mirrors `UpdateReusableBlockDto`. `blockType` is never edited here —
 * the Block Editor field is still constrained to exactly one top-level
 * block, but its `type` must stay whatever the block was created with
 * (the backend rejects a mismatched shape; see
 * `reusable-block-form.tsx`'s doc comment for why this isn't
 * client-enforced beyond that). */
export const updateReusableBlockSchema = z.object({
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

export type UpdateReusableBlockFormValues = z.infer<typeof updateReusableBlockSchema>;
