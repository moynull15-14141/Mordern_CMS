import { z } from 'zod';
import { blockTreeSchema } from '@/features/block-editor';

/** Mirrors `UpdatePatternDto`. */
export const updatePatternSchema = z.object({
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
  blocks: blockTreeSchema.min(1, 'A pattern needs at least one block.'),
});

export type UpdatePatternFormValues = z.infer<typeof updatePatternSchema>;
