import { z } from 'zod';

/** Mirrors `ArticleSeoDto` — only the simple, form-editable fields
 * (title/description/canonicalUrl/keywords). `openGraph`/`twitterCard`/
 * `schemaJson`/`robots`/`extraMeta` are real DTO fields but raw JSON blobs
 * with no structured editor in this milestone's scope — never sent by this
 * form (see docs/65_FRONTEND_ARTICLES.md "Known Limitations"). `keywords`
 * is `string[]` on the DTO but edited here as one comma-separated text
 * field (matching an RHF-bindable `<Input>`) — split into the real array
 * shape only at the page component's submit handler, the same "form-field
 * string, domain-shape at the boundary" pattern Frontend Milestone 4 used
 * for JSON/ARRAY setting values. */
export const articleSeoSchema = z.object({
  title: z.string().max(200, 'Must be 200 characters or fewer.').optional(),
  description: z.string().max(500, 'Must be 500 characters or fewer.').optional(),
  canonicalUrl: z.union([z.literal(''), z.string().url('Must be a valid URL.')]).optional(),
  keywords: z.string().optional(),
});

export type ArticleSeoFormValues = z.infer<typeof articleSeoSchema>;
