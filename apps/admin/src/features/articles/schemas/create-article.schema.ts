import { z } from 'zod';
import { blockTreeSchema } from '@/features/block-editor';
import { articleSeoSchema } from './article-seo.schema';

/**
 * Mirrors `CreateArticleDto` field-for-field. `body: Record<string, unknown>`
 * (an arbitrary JSON document tree) is represented here as `body:
 * BlockNode[]` — the Rich Content Engine's Block Editor (Milestone 3,
 * `@/features/block-editor`) edits a block *list*, not the `{blocks:
 * [...]}` wire shape `Article.body` actually stores; the page component
 * wraps/unwraps that one layer at the API boundary (see
 * `create-article-page-content.tsx`). No `status` field exists on
 * `CreateArticleDto` — every created article starts in the backend's own
 * default status.
 */
export const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(300, 'Must be 300 characters or fewer.'),
  subtitle: z.string().max(300, 'Must be 300 characters or fewer.').optional(),
  slug: z.string().max(200, 'Must be 200 characters or fewer.').optional(),
  summary: z.string().max(1000, 'Must be 1000 characters or fewer.').optional(),
  body: blockTreeSchema,
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
