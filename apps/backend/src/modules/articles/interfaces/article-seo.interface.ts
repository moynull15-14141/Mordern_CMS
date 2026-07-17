/**
 * Mirrors the frozen `SeoMeta` model's editable fields
 * (`36_DATABASE_FREEZE.md`). Articles upserts its own `SeoMeta` row through
 * this shape rather than exposing a separate SEO management endpoint —
 * `SeoMeta` is not enforced 1:1 with `Article` at the schema level (it's
 * declared one-to-many from the SeoMeta side), so this module enforces
 * "one SeoMeta row per article, never shared" at the application layer only.
 */
export interface ArticleSeoInput {
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
