import { z } from 'zod';
import { pageSeoSchema } from '@/features/pages/schemas/page-seo.schema';

/**
 * Page Settings (spec Phase 12) — deliberately NOT the full
 * `updatePageSchema` (that one also carries `body: blockTreeSchema`,
 * which this drawer has no business touching — the canvas's own
 * autosave owns `body` exclusively, so a settings save must never
 * include it in the PATCH). Reuses the real `pageSeoSchema` rather than
 * a parallel one.
 */
export const pageSettingsSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(300, 'Must be 300 characters or fewer.'),
  slug: z.string().max(200, 'Must be 200 characters or fewer.').optional(),
  status: z.enum(['DRAFT', 'REVIEW', 'ARCHIVED']),
  seo: pageSeoSchema.optional(),
});

export type PageSettingsFormValues = z.infer<typeof pageSettingsSchema>;
