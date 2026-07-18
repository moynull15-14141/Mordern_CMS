import { z } from 'zod';

/** Mirrors `UpdateMediaAssetDto` (PATCH semantics). */
export const updateMediaAssetSchema = z.object({
  altText: z.string().max(500, 'Must be 500 characters or fewer.').optional(),
  caption: z.string().max(1000, 'Must be 1000 characters or fewer.').optional(),
  credit: z.string().max(300, 'Must be 300 characters or fewer.').optional(),
  status: z.enum(['PROCESSING', 'READY', 'FAILED', 'ARCHIVED']),
});

export type UpdateMediaAssetFormValues = z.infer<typeof updateMediaAssetSchema>;
