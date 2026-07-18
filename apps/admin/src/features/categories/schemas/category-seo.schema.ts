import { z } from 'zod';

/** Mirrors `CategorySeoDto` — only the simple, form-editable fields
 * (title/description/canonicalUrl/keywords), same simplification Frontend
 * Milestone 5 applied to `ArticleSeoDto`. `openGraph`/`twitterCard`/
 * `schemaJson`/`robots`/`extraMeta` are real DTO fields but raw JSON blobs
 * with no structured editor in this milestone's scope. `keywords` is
 * `string[]` on the DTO but edited here as one comma-separated text field,
 * split into the real array shape only at the page component's submit
 * handler. */
export const categorySeoSchema = z.object({
  title: z.string().max(200, 'Must be 200 characters or fewer.').optional(),
  description: z.string().max(500, 'Must be 500 characters or fewer.').optional(),
  canonicalUrl: z.union([z.literal(''), z.string().url('Must be a valid URL.')]).optional(),
  keywords: z.string().optional(),
});

export type CategorySeoFormValues = z.infer<typeof categorySeoSchema>;
