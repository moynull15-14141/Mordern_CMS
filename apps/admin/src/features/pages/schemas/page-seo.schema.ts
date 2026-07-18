import { z } from 'zod';

/** Mirrors `PageSeoDto` — only the simple, form-editable fields
 * (title/description/canonicalUrl/keywords), same simplification Articles'
 * and Categories' own SEO forms use. `openGraph`/`twitterCard`/
 * `schemaJson`/`robots`/`extraMeta` are real DTO fields but raw JSON blobs
 * with no structured editor here. `keywords` is `string[]` on the DTO but
 * edited as one comma-separated text field, split into the real array
 * shape only at the page component's submit handler. */
export const pageSeoSchema = z.object({
  title: z.string().max(200, 'Must be 200 characters or fewer.').optional(),
  description: z.string().max(500, 'Must be 500 characters or fewer.').optional(),
  canonicalUrl: z.union([z.literal(''), z.string().url('Must be a valid URL.')]).optional(),
  keywords: z.string().optional(),
});

export type PageSeoFormValues = z.infer<typeof pageSeoSchema>;
