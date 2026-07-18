/** Mirrors `SeoFieldsDto`/`SeoResponseDto` 1:1 —
 * `apps/backend/src/modules/seo/dto/*`. JSON-blob fields
 * (`openGraph`/`twitterCard`/`schemaJson`/`robots`/`extraMeta`) stay
 * `Record<string, unknown>` on the wire; the editor form narrows them into
 * structured shapes only for the fields it actually renders. */
export interface SeoFields {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  openGraph?: Record<string, unknown>;
  twitterCard?: Record<string, unknown>;
  schemaJson?: Record<string, unknown>;
  robots?: Record<string, unknown>;
  extraMeta?: Record<string, unknown>;
}

export interface SeoMeta extends Omit<
  SeoFields,
  | 'title'
  | 'description'
  | 'canonicalUrl'
  | 'keywords'
  | 'openGraph'
  | 'twitterCard'
  | 'schemaJson'
  | 'robots'
  | 'extraMeta'
> {
  id: string;
  siteId: string;
  title: string | null;
  description: string | null;
  keywords: string[];
  canonicalUrl: string | null;
  openGraph: Record<string, unknown> | null;
  twitterCard: Record<string, unknown> | null;
  schemaJson: Record<string, unknown> | null;
  robots: Record<string, unknown> | null;
  extraMeta: Record<string, unknown> | null;
  schemaJsonPretty: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateSeoInput extends SeoFields {
  siteId: string;
}

export type UpdateSeoInput = SeoFields;

export interface UpsertSeoInput extends CreateSeoInput {
  id?: string;
}

export type SeoPreviewInput = SeoFields;
export type SeoValidateInput = SeoFields;

export interface SeoPreviewResult {
  title: string | null;
  description: string | null;
  image: string | null;
  canonical: string | null;
  robots: Record<string, unknown> | null;
  openGraph: Record<string, unknown> | null;
  twitterCard: Record<string, unknown> | null;
}

/** `SeoWarningCode` — `apps/backend/src/modules/seo/interfaces/seo-warning.interface.ts`.
 * No score enum exists server-side; only these 9 codes. */
export type SeoWarningCode =
  | 'TITLE_MISSING'
  | 'TITLE_TOO_SHORT'
  | 'TITLE_TOO_LONG'
  | 'DESCRIPTION_MISSING'
  | 'DESCRIPTION_TOO_SHORT'
  | 'DESCRIPTION_TOO_LONG'
  | 'CANONICAL_MISSING'
  | 'IMAGE_MISSING'
  | 'ROBOTS_INVALID';

export interface SeoWarning {
  code: SeoWarningCode;
  field: string;
  message: string;
}

export interface SeoValidationError {
  field: string;
  message: string;
}

export interface SeoValidationResult {
  valid: boolean;
  errors: SeoValidationError[];
  analysis: { warnings: SeoWarning[] };
}

/** Which real backend entity a `SeoMeta` row is being edited for — drives
 * which lookup endpoint (`/seo/article/:id` vs `/seo/category/:id`) and
 * which real list is used to populate the picker. Not a backend concept;
 * purely a frontend routing convenience for this standalone SEO Manager. */
export type SeoEntityType = 'article' | 'category';
