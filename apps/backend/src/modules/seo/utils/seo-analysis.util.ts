import {
  SEO_DESCRIPTION_RECOMMENDED_MAX,
  SEO_DESCRIPTION_RECOMMENDED_MIN,
  SEO_TITLE_RECOMMENDED_MAX,
  SEO_TITLE_RECOMMENDED_MIN,
} from '../constants/seo.constants';
import { SeoWarning, SeoWarningCode } from '../interfaces/seo-warning.interface';

export interface SeoAnalysisInput {
  title?: string | null;
  description?: string | null;
  canonicalUrl?: string | null;
  openGraph?: Record<string, unknown> | null;
  twitterCard?: Record<string, unknown> | null;
  robotsValid?: boolean;
}

/**
 * Pure, deterministic — no AI, no scoring algorithm (per instruction).
 * Returns warnings only; never throws, never blocks a write. Mirrors the
 * "advisory, not enforced" split `41_PLATFORM_CAPABILITIES.md`'s SEO
 * Philosophy describes for a future "SEO Suggestions" feature, scoped down
 * here to deterministic length/presence checks only.
 */
export function analyzeSeo(input: SeoAnalysisInput): SeoWarning[] {
  const warnings: SeoWarning[] = [];

  if (!input.title || input.title.trim().length === 0) {
    warnings.push({
      code: SeoWarningCode.TITLE_MISSING,
      field: 'title',
      message: 'Title is missing.',
    });
  } else {
    const length = input.title.trim().length;
    if (length < SEO_TITLE_RECOMMENDED_MIN) {
      warnings.push({
        code: SeoWarningCode.TITLE_TOO_SHORT,
        field: 'title',
        message: `Title is shorter than the recommended ${SEO_TITLE_RECOMMENDED_MIN} characters.`,
      });
    } else if (length > SEO_TITLE_RECOMMENDED_MAX) {
      warnings.push({
        code: SeoWarningCode.TITLE_TOO_LONG,
        field: 'title',
        message: `Title is longer than the recommended ${SEO_TITLE_RECOMMENDED_MAX} characters.`,
      });
    }
  }

  if (!input.description || input.description.trim().length === 0) {
    warnings.push({
      code: SeoWarningCode.DESCRIPTION_MISSING,
      field: 'description',
      message: 'Description is missing.',
    });
  } else {
    const length = input.description.trim().length;
    if (length < SEO_DESCRIPTION_RECOMMENDED_MIN) {
      warnings.push({
        code: SeoWarningCode.DESCRIPTION_TOO_SHORT,
        field: 'description',
        message: `Description is shorter than the recommended ${SEO_DESCRIPTION_RECOMMENDED_MIN} characters.`,
      });
    } else if (length > SEO_DESCRIPTION_RECOMMENDED_MAX) {
      warnings.push({
        code: SeoWarningCode.DESCRIPTION_TOO_LONG,
        field: 'description',
        message: `Description is longer than the recommended ${SEO_DESCRIPTION_RECOMMENDED_MAX} characters.`,
      });
    }
  }

  if (!input.canonicalUrl || input.canonicalUrl.trim().length === 0) {
    warnings.push({
      code: SeoWarningCode.CANONICAL_MISSING,
      field: 'canonicalUrl',
      message: 'Canonical URL is missing.',
    });
  }

  const hasOgImage = typeof input.openGraph?.image === 'string' && input.openGraph.image.length > 0;
  const hasTwitterImage =
    typeof input.twitterCard?.image === 'string' && input.twitterCard.image.length > 0;
  if (!hasOgImage && !hasTwitterImage) {
    warnings.push({
      code: SeoWarningCode.IMAGE_MISSING,
      field: 'openGraph.image',
      message: 'No OpenGraph or Twitter Card image is set.',
    });
  }

  if (input.robotsValid === false) {
    warnings.push({
      code: SeoWarningCode.ROBOTS_INVALID,
      field: 'robots',
      message: 'Robots directives are invalid.',
    });
  }

  return warnings;
}
