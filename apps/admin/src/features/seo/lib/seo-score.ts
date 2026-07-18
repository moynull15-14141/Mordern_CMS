import type { SeoFields } from '../types/seo';

/** Context beyond raw `SeoFields` needed to score real editorial state —
 * the backend's `analyzeSeo()` only ever sees `SeoFieldsDto`, so anything
 * here that isn't a `SeoFields` key (slug/featuredImage/altText) is a
 * frontend-only enrichment, computed independently, never claimed as a
 * backend value. */
export interface SeoScoreInput extends SeoFields {
  slug?: string;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
}

export type SeoCheckId =
  | 'title'
  | 'description'
  | 'canonical'
  | 'openGraph'
  | 'twitter'
  | 'featuredImage'
  | 'slug'
  | 'robots'
  | 'schema'
  | 'altText';

export type SeoCheckSeverity = 'critical' | 'warning' | 'suggestion';

export interface SeoCheck {
  id: SeoCheckId;
  label: string;
  passed: boolean;
  severity: SeoCheckSeverity;
  message: string;
}

export type SeoStatus = 'excellent' | 'good' | 'needs-improvement' | 'poor';

export interface SeoScoreResult {
  score: number;
  status: SeoStatus;
  completion: number;
  checks: SeoCheck[];
  passed: SeoCheck[];
  warnings: SeoCheck[];
  errors: SeoCheck[];
}

/** Frontend-only scoring — the backend deliberately computes no numeric
 * score (`apps/backend/src/modules/seo/utils/seo-analysis.util.ts` returns
 * warnings only). Thresholds mirror the backend's own
 * `constants/seo.constants.ts` (title 10-60, description 50-160) so the
 * "Title too short/long" checklist item never disagrees with what
 * `POST /seo/validate` would also flag. Fields with no backend threshold
 * (slug/OG/Twitter/schema/alt text) use conservative, clearly-labelled
 * heuristics — never presented as backend-verified. */
const TITLE_MIN = 10;
const TITLE_MAX = 60;
const DESCRIPTION_MIN = 50;
const DESCRIPTION_MAX = 160;

function hasKeys(value: Record<string, unknown> | undefined, keys: string[]): boolean {
  if (!value) return false;
  return keys.some((key) => {
    const v = value[key];
    return v !== undefined && v !== null && v !== '';
  });
}

export function computeSeoScore(input: SeoScoreInput): SeoScoreResult {
  const title = input.title?.trim() ?? '';
  const description = input.description?.trim() ?? '';

  const checks: SeoCheck[] = [
    {
      id: 'title',
      label: 'SEO Title',
      severity: 'critical',
      passed: title.length >= TITLE_MIN && title.length <= TITLE_MAX,
      message: !title
        ? 'Title is missing.'
        : title.length < TITLE_MIN
          ? 'Title is too short (recommended 10-60 characters).'
          : title.length > TITLE_MAX
            ? 'Title is too long (recommended 10-60 characters).'
            : 'Title length is good.',
    },
    {
      id: 'description',
      label: 'Meta Description',
      severity: 'critical',
      passed: description.length >= DESCRIPTION_MIN && description.length <= DESCRIPTION_MAX,
      message: !description
        ? 'Description is missing.'
        : description.length < DESCRIPTION_MIN
          ? 'Description is too short (recommended 50-160 characters).'
          : description.length > DESCRIPTION_MAX
            ? 'Description is too long (recommended 50-160 characters).'
            : 'Description length is good.',
    },
    {
      id: 'canonical',
      label: 'Canonical URL',
      severity: 'warning',
      passed: Boolean(input.canonicalUrl?.trim()),
      message: input.canonicalUrl?.trim() ? 'Canonical URL is set.' : 'Canonical URL is missing.',
    },
    {
      id: 'openGraph',
      label: 'Open Graph',
      severity: 'warning',
      passed: hasKeys(input.openGraph, ['title', 'description', 'image']),
      message: hasKeys(input.openGraph, ['title', 'description', 'image'])
        ? 'Open Graph fields are set.'
        : 'Open Graph title/description/image are missing.',
    },
    {
      id: 'twitter',
      label: 'Twitter Card',
      severity: 'suggestion',
      passed: hasKeys(input.twitterCard, ['title', 'description', 'image', 'card']),
      message: hasKeys(input.twitterCard, ['title', 'description', 'image', 'card'])
        ? 'Twitter Card fields are set.'
        : 'Twitter Card fields are missing.',
    },
    {
      id: 'featuredImage',
      label: 'Featured Image',
      severity: 'warning',
      passed: Boolean(input.featuredImage),
      message: input.featuredImage ? 'Featured image is set.' : 'Featured image is missing.',
    },
    {
      id: 'slug',
      label: 'Slug',
      severity: 'suggestion',
      passed: Boolean(input.slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)),
      message:
        input.slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)
          ? 'Slug is lowercase and hyphenated.'
          : 'Slug should be lowercase, hyphenated, and readable.',
    },
    {
      id: 'robots',
      label: 'Robots',
      severity: 'suggestion',
      passed: hasKeys(input.robots, ['index', 'noindex', 'follow', 'nofollow']),
      message: hasKeys(input.robots, ['index', 'noindex', 'follow', 'nofollow'])
        ? 'Robots directives are set.'
        : 'Robots directives are not set (defaults to index, follow).',
    },
    {
      id: 'schema',
      label: 'Schema',
      severity: 'suggestion',
      passed: Boolean(input.schemaJson && Object.keys(input.schemaJson).length > 0),
      message:
        input.schemaJson && Object.keys(input.schemaJson).length > 0
          ? 'Structured data is set.'
          : 'No structured data (schema.org JSON-LD) set.',
    },
    {
      id: 'altText',
      label: 'Featured Image Alt Text',
      severity: 'suggestion',
      passed: Boolean(input.featuredImageAlt?.trim()),
      message: input.featuredImageAlt?.trim()
        ? 'Alt text is set.'
        : 'Featured image alt text is missing.',
    },
  ];

  const weights: Record<SeoCheckSeverity, number> = { critical: 20, warning: 10, suggestion: 5 };
  const maxScore = checks.reduce((sum, c) => sum + weights[c.severity], 0);
  const earned = checks.reduce((sum, c) => sum + (c.passed ? weights[c.severity] : 0), 0);
  const score = maxScore > 0 ? Math.round((earned / maxScore) * 100) : 0;
  const completion = Math.round((checks.filter((c) => c.passed).length / checks.length) * 100);

  const status: SeoStatus =
    score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 40 ? 'needs-improvement' : 'poor';

  return {
    score,
    status,
    completion,
    checks,
    passed: checks.filter((c) => c.passed),
    warnings: checks.filter((c) => !c.passed && c.severity === 'warning'),
    errors: checks.filter((c) => !c.passed && c.severity === 'critical'),
  };
}

export const SEO_STATUS_LABEL: Record<SeoStatus, string> = {
  excellent: 'Excellent',
  good: 'Good',
  'needs-improvement': 'Needs Improvement',
  poor: 'Poor',
};
