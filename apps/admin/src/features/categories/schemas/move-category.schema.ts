import { z } from 'zod';

/** Mirrors `MoveCategoryDto` — an empty selection means "move to root"
 * (the DTO's `parentId` is omitted/null in that case). */
export const moveCategorySchema = z.object({
  parentId: z.string().optional(),
});

export type MoveCategoryFormValues = z.infer<typeof moveCategorySchema>;
