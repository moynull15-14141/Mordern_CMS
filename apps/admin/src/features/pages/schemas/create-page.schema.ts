import { z } from 'zod';
import { pageSeoSchema } from './page-seo.schema';

/**
 * Mirrors `CreatePageDto` field-for-field, with one deliberate frontend-only
 * substitution: the DTO's `body: Record<string, unknown>` (an arbitrary
 * JSON document tree) is represented here as a plain `bodyText: string` —
 * same placeholder approach `create-article.schema.ts` uses (no rich
 * editor integration yet). The page component wraps it as
 * `{ text: bodyText }` before calling the API. No `status` field exists on
 * `CreatePageDto` — every created page starts in the backend's own default
 * status.
 */
export const createPageSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(300, 'Must be 300 characters or fewer.'),
  slug: z.string().max(200, 'Must be 200 characters or fewer.').optional(),
  bodyText: z.string().min(1, 'Content is required.'),
  seo: pageSeoSchema.optional(),
});

export type CreatePageFormValues = z.infer<typeof createPageSchema>;
