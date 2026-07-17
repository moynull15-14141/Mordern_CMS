import { Injectable } from '@nestjs/common';
import { SecurityLoggerService } from '../../../core/logger/security-logger.service';
import {
  ROBOTS_BOOLEAN_DIRECTIVES,
  ROBOTS_MAX_IMAGE_PREVIEW_VALUES,
  SEO_DESCRIPTION_MAX_LENGTH,
  SEO_KEYWORDS_MAX_COUNT,
  SEO_KEYWORD_MAX_LENGTH,
  SEO_TITLE_MAX_LENGTH,
  TWITTER_CARD_TYPES,
} from '../constants/seo.constants';
import { SeoValidationException } from '../exceptions/seo.exceptions';
import { normalizeCanonicalUrl } from '../utils/canonical-url.util';

/** Loose, best-effort "is this a URL-shaped string" check — deliberately
 * not `class-validator`'s `isURL` (which this module doesn't import into a
 * plain class), used identically for OG-image/Twitter-image. */
function looksLikeUrl(value: string): boolean {
  try {
    void new URL(value);
    return true;
  } catch {
    return false;
  }
}

/** Stricter than `looksLikeUrl()` — used only by `assertCanonicalUrl`
 * (stabilization patch, post-Milestone-12 audit). A canonical URL is a
 * navigable web address, never a `javascript:`/`data:`/`vbscript:`
 * pseudo-scheme; `new URL()` alone accepts all of those since they are
 * syntactically valid URLs, just not http(s) ones. */
function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const SUSPICIOUS_INPUT_PATTERN = /<script|javascript:|onerror\s*=|onload\s*=/i;

@Injectable()
export class SeoValidator {
  constructor(private readonly securityLogger: SecurityLoggerService) {}

  /** Scans every string value in a JSON-ish object for an obvious XSS
   * payload marker. Logs via `SecurityLoggerService` (a genuine
   * security-relevant signal — this JSON is stored and will eventually be
   * rendered by a future frontend) AND rejects the write; this is stricter
   * than a "hook," matching the same reasoning `sanitize-body.util.ts`
   * applied in the Comments module (`49_COMMENTS_ARCHITECTURE.md`). */
  private assertNoSuspiciousContent(fieldName: string, value: Record<string, unknown>): void {
    for (const [key, val] of Object.entries(value)) {
      if (typeof val === 'string' && SUSPICIOUS_INPUT_PATTERN.test(val)) {
        this.securityLogger.record({
          event: 'seo.suspicious_input',
          field: `${fieldName}.${key}`,
        });
        throw new SeoValidationException(`${fieldName}.${key} contains disallowed content.`);
      }
    }
  }

  assertTitle(title: string | undefined): string | undefined {
    if (title === undefined) return undefined;
    const trimmed = title.trim();
    if (trimmed.length > SEO_TITLE_MAX_LENGTH) {
      throw new SeoValidationException(`Title cannot exceed ${SEO_TITLE_MAX_LENGTH} characters.`);
    }
    return trimmed;
  }

  assertDescription(description: string | undefined): string | undefined {
    if (description === undefined) return undefined;
    const trimmed = description.trim();
    if (trimmed.length > SEO_DESCRIPTION_MAX_LENGTH) {
      throw new SeoValidationException(
        `Description cannot exceed ${SEO_DESCRIPTION_MAX_LENGTH} characters.`
      );
    }
    return trimmed;
  }

  assertKeywords(keywords: string[] | undefined): string[] | undefined {
    if (keywords === undefined) return undefined;
    if (keywords.length > SEO_KEYWORDS_MAX_COUNT) {
      throw new SeoValidationException(`Cannot have more than ${SEO_KEYWORDS_MAX_COUNT} keywords.`);
    }
    for (const keyword of keywords) {
      if (keyword.trim().length === 0) {
        throw new SeoValidationException('Keywords cannot be empty strings.');
      }
      if (keyword.length > SEO_KEYWORD_MAX_LENGTH) {
        throw new SeoValidationException(
          `Each keyword cannot exceed ${SEO_KEYWORD_MAX_LENGTH} characters.`
        );
      }
    }
    return keywords;
  }

  /** Normalizes (see `utils/canonical-url.util.ts`) then validates the
   * result is a well-formed absolute URL, restricted to `http:`/`https:`
   * (stabilization patch, post-Milestone-12 audit — `javascript:`/`data:`/
   * `vbscript:` and every other pseudo-scheme are rejected). */
  assertCanonicalUrl(canonicalUrl: string | undefined): string | undefined {
    if (canonicalUrl === undefined) return undefined;
    const normalized = normalizeCanonicalUrl(canonicalUrl);
    if (!isHttpUrl(normalized)) {
      throw new SeoValidationException(
        `Canonical URL "${canonicalUrl}" must be a valid http:// or https:// URL.`
      );
    }
    return normalized;
  }

  assertOpenGraph(openGraph: Record<string, unknown> | undefined): void {
    if (openGraph === undefined) return;
    this.assertNoSuspiciousContent('openGraph', openGraph);
    for (const field of ['title', 'description', 'type', 'site_name', 'locale'] as const) {
      if (openGraph[field] !== undefined && typeof openGraph[field] !== 'string') {
        throw new SeoValidationException(`openGraph.${field} must be a string.`);
      }
    }
    for (const field of ['image', 'url'] as const) {
      const value = openGraph[field];
      if (value !== undefined) {
        if (typeof value !== 'string' || !looksLikeUrl(value)) {
          throw new SeoValidationException(`openGraph.${field} must be a valid URL.`);
        }
      }
    }
  }

  assertTwitterCard(twitterCard: Record<string, unknown> | undefined): void {
    if (twitterCard === undefined) return;
    this.assertNoSuspiciousContent('twitterCard', twitterCard);
    for (const field of ['title', 'description', 'creator', 'site'] as const) {
      if (twitterCard[field] !== undefined && typeof twitterCard[field] !== 'string') {
        throw new SeoValidationException(`twitterCard.${field} must be a string.`);
      }
    }
    if (twitterCard.image !== undefined) {
      if (typeof twitterCard.image !== 'string' || !looksLikeUrl(twitterCard.image)) {
        throw new SeoValidationException('twitterCard.image must be a valid URL.');
      }
    }
    if (twitterCard.card !== undefined) {
      if (
        typeof twitterCard.card !== 'string' ||
        !(TWITTER_CARD_TYPES as readonly string[]).includes(twitterCard.card)
      ) {
        throw new SeoValidationException(
          `twitterCard.card must be one of: ${TWITTER_CARD_TYPES.join(', ')}.`
        );
      }
    }
  }

  assertRobots(robots: Record<string, unknown> | undefined): void {
    if (robots === undefined) return;
    for (const directive of ROBOTS_BOOLEAN_DIRECTIVES) {
      if (robots[directive] !== undefined && typeof robots[directive] !== 'boolean') {
        throw new SeoValidationException(`robots.${directive} must be a boolean.`);
      }
    }
    const maxImagePreview = robots['max-image-preview'];
    if (maxImagePreview !== undefined) {
      if (
        typeof maxImagePreview !== 'string' ||
        !(ROBOTS_MAX_IMAGE_PREVIEW_VALUES as readonly string[]).includes(maxImagePreview)
      ) {
        throw new SeoValidationException(
          `robots.max-image-preview must be one of: ${ROBOTS_MAX_IMAGE_PREVIEW_VALUES.join(', ')}.`
        );
      }
    }
    for (const directive of ['max-video-preview', 'max-snippet'] as const) {
      const value = robots[directive];
      if (value !== undefined) {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < -1) {
          throw new SeoValidationException(`robots.${directive} must be an integer >= -1.`);
        }
      }
    }
  }

  assertJsonLd(schemaJson: Record<string, unknown> | undefined): void {
    if (schemaJson === undefined) return;
    if (Array.isArray(schemaJson) || typeof schemaJson !== 'object' || schemaJson === null) {
      throw new SeoValidationException('schemaJson must be a JSON object.');
    }
    this.assertNoSuspiciousContent('schemaJson', schemaJson);
  }
}
