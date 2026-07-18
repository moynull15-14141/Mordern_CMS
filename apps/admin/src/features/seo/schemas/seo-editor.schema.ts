import { z } from 'zod';

/** Mirrors `SeoFieldsDto` (`apps/backend/src/modules/seo/dto/seo-fields.dto.ts`)
 * — every constraint here matches a real `class-validator` decorator on
 * that DTO, never an invented rule. `keywords` is edited as one
 * comma-separated string (same simplification as the embedded article/
 * category SEO forms) and split into `string[]` at submit time.
 * `openGraph`/`twitterCard` expose only the well-known keys the preview
 * cards render; `robots` exposes the exact directive set the backend
 * validator checks (`validators/seo.validator.ts`); `schemaJson` is edited
 * as raw JSON text and parsed/validated as JSON before submit. */
export const seoEditorSchema = z.object({
  title: z.string().max(200, 'Must be 200 characters or fewer.').optional().or(z.literal('')),
  description: z.string().max(500, 'Must be 500 characters or fewer.').optional().or(z.literal('')),
  canonicalUrl: z
    .union([z.literal(''), z.string().url('Must be an absolute http(s) URL.')])
    .optional(),
  keywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.union([z.literal(''), z.string().url('Must be a valid URL.')]).optional(),
  twitterCard: z.enum(['summary', 'summary_large_image', 'app', 'player']).optional(),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: z.union([z.literal(''), z.string().url('Must be a valid URL.')]).optional(),
  robotsIndex: z.boolean().optional(),
  robotsFollow: z.boolean().optional(),
  schemaJsonText: z.string().optional(),
});

export type SeoEditorFormValues = z.infer<typeof seoEditorSchema>;
