/**
 * Mirrors `PageSeoDto`/`ArticleSeoDto`/`CategorySeoDto` — documented as
 * identical `SeoFieldsDto` shapes, one copy per content module
 * (`apps/backend/src/modules/pages/dto/page-seo.dto.ts`'s own doc
 * comment). Field-for-field, nothing invented.
 */
export interface PublicSeo {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  keywords?: string[];
  openGraph?: Record<string, unknown>;
  twitterCard?: Record<string, unknown>;
  schemaJson?: Record<string, unknown>;
  robots?: Record<string, unknown>;
  extraMeta?: Record<string, unknown>;
}
