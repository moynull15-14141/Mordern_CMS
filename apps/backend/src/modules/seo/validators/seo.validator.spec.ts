import { SecurityLoggerService } from '../../../core/logger/security-logger.service';
import { SEO_DESCRIPTION_MAX_LENGTH, SEO_TITLE_MAX_LENGTH } from '../constants/seo.constants';
import { SeoValidationException } from '../exceptions/seo.exceptions';
import { SeoValidator } from './seo.validator';

function buildValidator() {
  const securityLogger = { record: jest.fn() } as unknown as SecurityLoggerService;
  return { validator: new SeoValidator(securityLogger), securityLogger };
}

describe('SeoValidator', () => {
  describe('assertTitle', () => {
    it('returns undefined for undefined input', () => {
      const { validator } = buildValidator();
      expect(validator.assertTitle(undefined)).toBeUndefined();
    });

    it('trims the title', () => {
      const { validator } = buildValidator();
      expect(validator.assertTitle('  hello  ')).toBe('hello');
    });

    it('accepts a title exactly at the max length', () => {
      const { validator } = buildValidator();
      const title = 'a'.repeat(SEO_TITLE_MAX_LENGTH);
      expect(validator.assertTitle(title)).toBe(title);
    });

    it('throws when the title exceeds the max length', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertTitle('a'.repeat(SEO_TITLE_MAX_LENGTH + 1))).toThrow(
        SeoValidationException
      );
    });
  });

  describe('assertDescription', () => {
    it('returns undefined for undefined input', () => {
      const { validator } = buildValidator();
      expect(validator.assertDescription(undefined)).toBeUndefined();
    });

    it('trims the description', () => {
      const { validator } = buildValidator();
      expect(validator.assertDescription('  hi  ')).toBe('hi');
    });

    it('throws when the description exceeds the max length', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertDescription('a'.repeat(SEO_DESCRIPTION_MAX_LENGTH + 1))).toThrow(
        SeoValidationException
      );
    });
  });

  describe('assertKeywords', () => {
    it('returns undefined for undefined input', () => {
      const { validator } = buildValidator();
      expect(validator.assertKeywords(undefined)).toBeUndefined();
    });

    it('accepts a valid keyword list', () => {
      const { validator } = buildValidator();
      expect(validator.assertKeywords(['news', 'sports'])).toEqual(['news', 'sports']);
    });

    it('throws when there are too many keywords', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertKeywords(Array.from({ length: 21 }, (_, i) => `k${i}`))).toThrow(
        SeoValidationException
      );
    });

    it('throws when a keyword is empty', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertKeywords(['ok', '  '])).toThrow(SeoValidationException);
    });

    it('throws when a keyword exceeds the max length', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertKeywords(['a'.repeat(81)])).toThrow(SeoValidationException);
    });
  });

  describe('assertCanonicalUrl', () => {
    it('returns undefined for undefined input', () => {
      const { validator } = buildValidator();
      expect(validator.assertCanonicalUrl(undefined)).toBeUndefined();
    });

    it('normalizes and returns a valid URL', () => {
      const { validator } = buildValidator();
      expect(validator.assertCanonicalUrl('https://example.com/foo//bar/')).toBe(
        'https://example.com/foo/bar'
      );
    });

    it('throws for a non-URL string', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertCanonicalUrl('not a url')).toThrow(SeoValidationException);
    });

    it('throws for a relative path with no scheme', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertCanonicalUrl('/just/a/path')).toThrow(SeoValidationException);
    });

    it('accepts a plain http:// URL', () => {
      const { validator } = buildValidator();
      expect(validator.assertCanonicalUrl('http://example.com/page')).toBe(
        'http://example.com/page'
      );
    });

    it('rejects a javascript: pseudo-scheme (stabilization patch)', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertCanonicalUrl('javascript:alert(1)')).toThrow(
        SeoValidationException
      );
    });

    it('rejects a data: URI (stabilization patch)', () => {
      const { validator } = buildValidator();
      expect(() =>
        validator.assertCanonicalUrl('data:text/html,<script>alert(1)</script>')
      ).toThrow(SeoValidationException);
    });

    it('rejects a vbscript: pseudo-scheme (stabilization patch)', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertCanonicalUrl('vbscript:msgbox(1)')).toThrow(
        SeoValidationException
      );
    });

    it('rejects a file: URI (stabilization patch)', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertCanonicalUrl('file:///etc/passwd')).toThrow(
        SeoValidationException
      );
    });
  });

  describe('assertOpenGraph', () => {
    it('passes for undefined input', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertOpenGraph(undefined)).not.toThrow();
    });

    it('accepts a fully valid object', () => {
      const { validator } = buildValidator();
      expect(() =>
        validator.assertOpenGraph({
          title: 't',
          description: 'd',
          image: 'https://example.com/img.png',
          type: 'article',
          url: 'https://example.com',
          site_name: 'Site',
          locale: 'en_US',
        })
      ).not.toThrow();
    });

    it('throws when title is not a string', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertOpenGraph({ title: 123 })).toThrow(SeoValidationException);
    });

    it('throws when image is not a valid URL', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertOpenGraph({ image: 'not-a-url' })).toThrow(
        SeoValidationException
      );
    });

    it('throws and logs via SecurityLogger when a string field contains a script tag', () => {
      const { validator, securityLogger } = buildValidator();
      expect(() => validator.assertOpenGraph({ title: '<script>alert(1)</script>' })).toThrow(
        SeoValidationException
      );
      expect(securityLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'seo.suspicious_input' })
      );
    });
  });

  describe('assertTwitterCard', () => {
    it('passes for undefined input', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertTwitterCard(undefined)).not.toThrow();
    });

    it('accepts a fully valid object', () => {
      const { validator } = buildValidator();
      expect(() =>
        validator.assertTwitterCard({
          title: 't',
          description: 'd',
          image: 'https://example.com/img.png',
          card: 'summary_large_image',
          creator: '@me',
          site: '@site',
        })
      ).not.toThrow();
    });

    it('throws when card is not a recognized type', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertTwitterCard({ card: 'not_a_real_card' })).toThrow(
        SeoValidationException
      );
    });

    it('throws when image is not a valid URL', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertTwitterCard({ image: 'nope' })).toThrow(SeoValidationException);
    });

    it('throws when creator is not a string', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertTwitterCard({ creator: 123 })).toThrow(SeoValidationException);
    });

    it('throws and logs via SecurityLogger for suspicious content', () => {
      const { validator, securityLogger } = buildValidator();
      expect(() => validator.assertTwitterCard({ description: 'javascript:alert(1)' })).toThrow(
        SeoValidationException
      );
      expect(securityLogger.record).toHaveBeenCalled();
    });
  });

  describe('assertRobots', () => {
    it('passes for undefined input', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertRobots(undefined)).not.toThrow();
    });

    it('accepts a fully valid robots object', () => {
      const { validator } = buildValidator();
      expect(() =>
        validator.assertRobots({
          index: true,
          noindex: false,
          follow: true,
          nofollow: false,
          nosnippet: false,
          'max-image-preview': 'large',
          'max-video-preview': -1,
          'max-snippet': 160,
        })
      ).not.toThrow();
    });

    it('throws when a boolean directive is not a boolean', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertRobots({ index: 'yes' })).toThrow(SeoValidationException);
    });

    it('throws for an invalid max-image-preview value', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertRobots({ 'max-image-preview': 'huge' })).toThrow(
        SeoValidationException
      );
    });

    it('throws for a non-integer max-video-preview', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertRobots({ 'max-video-preview': 1.5 })).toThrow(
        SeoValidationException
      );
    });

    it('throws for a max-snippet below -1', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertRobots({ 'max-snippet': -2 })).toThrow(SeoValidationException);
    });

    it('accepts -1 for max-snippet and max-video-preview (the documented "no limit" sentinel)', () => {
      const { validator } = buildValidator();
      expect(() =>
        validator.assertRobots({ 'max-snippet': -1, 'max-video-preview': -1 })
      ).not.toThrow();
    });
  });

  describe('assertJsonLd', () => {
    it('passes for undefined input', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertJsonLd(undefined)).not.toThrow();
    });

    it('accepts a plain object', () => {
      const { validator } = buildValidator();
      expect(() => validator.assertJsonLd({ '@type': 'Article', headline: 'Hi' })).not.toThrow();
    });

    it('throws for an array', () => {
      const { validator } = buildValidator();
      expect(() =>
        validator.assertJsonLd([{ a: 1 }] as unknown as Record<string, unknown>)
      ).toThrow(SeoValidationException);
    });

    it('throws and logs via SecurityLogger for suspicious content', () => {
      const { validator, securityLogger } = buildValidator();
      expect(() => validator.assertJsonLd({ headline: '<script>bad()</script>' })).toThrow(
        SeoValidationException
      );
      expect(securityLogger.record).toHaveBeenCalled();
    });
  });
});
