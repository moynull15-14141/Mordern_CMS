import { z } from 'zod';
import { pageSeoSchema } from './page-seo.schema';

/** Mirrors `UpdatePageDto` (PATCH semantics). `status` is restricted to
 * `GenericUpdateStatus` (DRAFT/REVIEW/ARCHIVED) — PUBLISHED is set only via
 * the dedicated Publish action, never this form. Same `bodyText`
 * substitution as `createPageSchema` — see that file's comment. */
export const updatePageSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(300, 'Must be 300 characters or fewer.'),
  slug: z.string().max(200, 'Must be 200 characters or fewer.').optional(),
  bodyText: z.string().min(1, 'Content is required.'),
  status: z.enum(['DRAFT', 'REVIEW', 'ARCHIVED']),
  seo: pageSeoSchema.optional(),
});

export type UpdatePageFormValues = z.infer<typeof updatePageSchema>;
