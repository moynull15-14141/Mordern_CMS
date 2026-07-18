import { z } from 'zod';

/** Mirrors `RenameMediaAssetDto` — logical display name only; `storageKey`
 * is never changed by this or any other endpoint. */
export const renameMediaAssetSchema = z.object({
  filename: z.string().min(1, 'Filename is required.').max(300, 'Must be 300 characters or fewer.'),
});

export type RenameMediaAssetFormValues = z.infer<typeof renameMediaAssetSchema>;
