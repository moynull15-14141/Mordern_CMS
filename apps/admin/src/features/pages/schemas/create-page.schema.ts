import { z } from 'zod';
import { blockTreeSchema } from '@/features/block-editor';
import { pageSeoSchema } from './page-seo.schema';

/**
 * Mirrors `CreatePageDto` field-for-field. `body: Record<string, unknown>`
 * (an arbitrary JSON document tree) is represented here as `body:
 * BlockNode[]` — same Block Editor integration `create-article.schema.ts`
 * uses (see that file's comment). No `status` field exists on
 * `CreatePageDto` — every created page starts in the backend's own default
 * status.
 */
export const createPageSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(300, 'Must be 300 characters or fewer.'),
  slug: z.string().max(200, 'Must be 200 characters or fewer.').optional(),
  body: blockTreeSchema,
  seo: pageSeoSchema.optional(),
});

export type CreatePageFormValues = z.infer<typeof createPageSchema>;
