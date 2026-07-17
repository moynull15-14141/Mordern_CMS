/**
 * SEO & Metadata Engine Foundation (Milestone 12). Hard structural caps
 * mirror the existing `ArticleSeoDto` (`modules/articles/dto/article-seo.dto.ts`,
 * Milestone 8) exactly — reused, not reinvented, since both write into the
 * same frozen `SeoMeta.title`/`SeoMeta.description` columns.
 */
export const SEO_TITLE_MAX_LENGTH = 200;
export const SEO_DESCRIPTION_MAX_LENGTH = 500;

/** Soft, advisory thresholds for `SEO Analysis` warnings only — never
 * enforced as hard validation (a title of 5 or 90 characters is still a
 * legal write). Widely-cited search-snippet length conventions, not
 * invented by this module. */
export const SEO_TITLE_RECOMMENDED_MIN = 10;
export const SEO_TITLE_RECOMMENDED_MAX = 60;
export const SEO_DESCRIPTION_RECOMMENDED_MIN = 50;
export const SEO_DESCRIPTION_RECOMMENDED_MAX = 160;

export const SEO_KEYWORDS_MAX_COUNT = 20;
export const SEO_KEYWORD_MAX_LENGTH = 80;

/** Real, documented values for the `max-image-preview` robots directive
 * (Google's robots meta tag spec) — not invented by this module. */
export const ROBOTS_MAX_IMAGE_PREVIEW_VALUES = ['none', 'standard', 'large'] as const;

/** Real, documented Twitter Card types — not invented by this module. */
export const TWITTER_CARD_TYPES = ['summary', 'summary_large_image', 'app', 'player'] as const;

/** Boolean-valued robots directives — presence in the frozen `robots: Json?`
 * column means "on," but the value itself is still validated as a real
 * boolean when provided (see `SeoValidator.assertRobots`). */
export const ROBOTS_BOOLEAN_DIRECTIVES = [
  'index',
  'noindex',
  'follow',
  'nofollow',
  'nosnippet',
] as const;
