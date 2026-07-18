import { z } from 'zod';
import { articleSeoSchema } from './article-seo.schema';

/**
 * Mirrors `CreateArticleDto` field-for-field, with one deliberate
 * frontend-only substitution: the DTO's `body: Record<string, unknown>`
 * (an arbitrary JSON document tree, meant for a future rich content editor)
 * is represented here as a plain `bodyText: string` — this milestone's
 * content editor is an explicit placeholder (no rich editor integration
 * yet). The page component wraps it as `{ text: bodyText }` before calling
 * the API — the only shape a `@IsObject()`-validated field with no nested
 * schema actually requires. No `status` field exists on `CreateArticleDto`
 * — every created article starts in the backend's own default status.
 */
export const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(300, 'Must be 300 characters or fewer.'),
  subtitle: z.string().max(300, 'Must be 300 characters or fewer.').optional(),
  slug: z.string().max(200, 'Must be 200 characters or fewer.').optional(),
  summary: z.string().max(1000, 'Must be 1000 characters or fewer.').optional(),
  bodyText: z.string().min(1, 'Content is required.'),
  authorId: z.string().uuid('Must be a valid Author id (UUID).'),
  primaryCategoryId: z.union([z.literal(''), z.string().uuid()]).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  primaryTagId: z.union([z.literal(''), z.string().uuid()]).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']).optional(),
  language: z.string().min(1, 'Language is required.').max(10, 'Must be 10 characters or fewer.'),
  locale: z.string().min(1, 'Locale is required.').max(10, 'Must be 10 characters or fewer.'),
  featuredMediaId: z.union([z.literal(''), z.string().uuid()]).optional(),
  notes: z.string().max(2000, 'Must be 2000 characters or fewer.').optional(),
  seo: articleSeoSchema.optional(),
});

export type CreateArticleFormValues = z.infer<typeof createArticleSchema>;
