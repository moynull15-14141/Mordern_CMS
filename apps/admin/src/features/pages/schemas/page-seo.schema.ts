import { z } from 'zod';

/** Mirrors `PageSeoDto` — the simple, form-editable fields
 * (title/description/canonicalUrl/keywords), same simplification Articles'
 * and Categories' own SEO forms use, PLUS `noIndex`/`noFollow`/`ogImage` —
 * narrow, structured slices of the DTO's `robots`/`openGraph` JSON blobs,
 * the same two keys (`robots.{index,follow}`, `openGraph.image`) the SEO
 * Intelligence Center's own editor (`features/seo/components/seo-editor-form.tsx`)
 * already reads/writes for Articles/Categories — reused here, not
 * reinvented, so a No Index page behaves identically regardless of which
 * editor set it. `twitterCard`/`schemaJson`/`extraMeta` remain out of
 * scope for this simpler, page-embedded form. `keywords` is `string[]` on
 * the DTO but edited as one comma-separated text field, split into the
 * real array shape only at the page component's submit handler. */
export const pageSeoSchema = z.object({
  title: z.string().max(200, 'Must be 200 characters or fewer.').optional(),
  description: z.string().max(500, 'Must be 500 characters or fewer.').optional(),
  canonicalUrl: z.union([z.literal(''), z.string().url('Must be a valid URL.')]).optional(),
  keywords: z.string().optional(),
  noIndex: z.boolean().optional(),
  noFollow: z.boolean().optional(),
  ogImage: z.union([z.literal(''), z.string().url('Must be a valid URL.')]).optional(),
});

export type PageSeoFormValues = z.infer<typeof pageSeoSchema>;
