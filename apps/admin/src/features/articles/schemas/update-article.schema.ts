import { z } from 'zod';
import { articleSeoSchema } from './article-seo.schema';

/** Mirrors `UpdateArticleDto` (PATCH semantics). `status` is restricted to
 * `GenericUpdateStatus` (DRAFT/REVIEW/ARCHIVED) — PUBLISHED/SCHEDULED are
 * set only via the dedicated Publish/Schedule actions, never this form. Same
 * `bodyText` substitution as `createArticleSchema` — see that file's
 * comment. No `authorId`/`language`/`locale` fields — `UpdateArticleDto`
 * doesn't expose them as editable. */
export const updateArticleSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(300, 'Must be 300 characters or fewer.'),
  subtitle: z.string().max(300, 'Must be 300 characters or fewer.').optional(),
  slug: z.string().max(200, 'Must be 200 characters or fewer.').optional(),
  summary: z.string().max(1000, 'Must be 1000 characters or fewer.').optional(),
  bodyText: z.string().min(1, 'Content is required.'),
  status: z.enum(['DRAFT', 'REVIEW', 'ARCHIVED']),
  primaryCategoryId: z.union([z.literal(''), z.string().uuid()]).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  primaryTagId: z.union([z.literal(''), z.string().uuid()]).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']).optional(),
  featuredMediaId: z.union([z.literal(''), z.string().uuid()]).optional(),
  notes: z.string().max(2000, 'Must be 2000 characters or fewer.').optional(),
  seo: articleSeoSchema.optional(),
  revisionComment: z.string().max(500, 'Must be 500 characters or fewer.').optional(),
});

export type UpdateArticleFormValues = z.infer<typeof updateArticleSchema>;
