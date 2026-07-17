import { analyzeSeo } from './seo-analysis.util';
import { SeoWarningCode } from '../interfaces/seo-warning.interface';

describe('analyzeSeo', () => {
  it('returns no title/description/canonical warnings for a fully-populated, well-sized input', () => {
    const warnings = analyzeSeo({
      title: 'A reasonably sized article title',
      description: 'A'.repeat(100),
      canonicalUrl: 'https://example.com/article',
      openGraph: { image: 'https://example.com/img.png' },
    });
    expect(warnings.some((w) => w.code === SeoWarningCode.TITLE_MISSING)).toBe(false);
    expect(warnings.some((w) => w.code === SeoWarningCode.DESCRIPTION_MISSING)).toBe(false);
    expect(warnings.some((w) => w.code === SeoWarningCode.CANONICAL_MISSING)).toBe(false);
    expect(warnings.some((w) => w.code === SeoWarningCode.IMAGE_MISSING)).toBe(false);
  });

  it('flags a missing title', () => {
    const warnings = analyzeSeo({});
    expect(warnings.some((w) => w.code === SeoWarningCode.TITLE_MISSING)).toBe(true);
  });

  it('flags a title that is only whitespace as missing', () => {
    const warnings = analyzeSeo({ title: '   ' });
    expect(warnings.some((w) => w.code === SeoWarningCode.TITLE_MISSING)).toBe(true);
  });

  it('flags a title shorter than the recommended minimum', () => {
    const warnings = analyzeSeo({ title: 'Short' });
    expect(warnings.some((w) => w.code === SeoWarningCode.TITLE_TOO_SHORT)).toBe(true);
  });

  it('flags a title longer than the recommended maximum', () => {
    const warnings = analyzeSeo({ title: 'A'.repeat(100) });
    expect(warnings.some((w) => w.code === SeoWarningCode.TITLE_TOO_LONG)).toBe(true);
  });

  it('flags a missing description', () => {
    const warnings = analyzeSeo({});
    expect(warnings.some((w) => w.code === SeoWarningCode.DESCRIPTION_MISSING)).toBe(true);
  });

  it('flags a description shorter than the recommended minimum', () => {
    const warnings = analyzeSeo({ description: 'too short' });
    expect(warnings.some((w) => w.code === SeoWarningCode.DESCRIPTION_TOO_SHORT)).toBe(true);
  });

  it('flags a description longer than the recommended maximum', () => {
    const warnings = analyzeSeo({ description: 'A'.repeat(200) });
    expect(warnings.some((w) => w.code === SeoWarningCode.DESCRIPTION_TOO_LONG)).toBe(true);
  });

  it('flags a missing canonical URL', () => {
    const warnings = analyzeSeo({});
    expect(warnings.some((w) => w.code === SeoWarningCode.CANONICAL_MISSING)).toBe(true);
  });

  it('flags a missing image when neither openGraph nor twitterCard has one', () => {
    const warnings = analyzeSeo({});
    expect(warnings.some((w) => w.code === SeoWarningCode.IMAGE_MISSING)).toBe(true);
  });

  it('does not flag image missing when only twitterCard has an image', () => {
    const warnings = analyzeSeo({ twitterCard: { image: 'https://example.com/img.png' } });
    expect(warnings.some((w) => w.code === SeoWarningCode.IMAGE_MISSING)).toBe(false);
  });

  it('flags invalid robots when robotsValid is explicitly false', () => {
    const warnings = analyzeSeo({ robotsValid: false });
    expect(warnings.some((w) => w.code === SeoWarningCode.ROBOTS_INVALID)).toBe(true);
  });

  it('does not flag robots when robotsValid is true or omitted', () => {
    expect(
      analyzeSeo({ robotsValid: true }).some((w) => w.code === SeoWarningCode.ROBOTS_INVALID)
    ).toBe(false);
    expect(analyzeSeo({}).some((w) => w.code === SeoWarningCode.ROBOTS_INVALID)).toBe(false);
  });

  it('returns an empty array for a fully valid, complete input', () => {
    const warnings = analyzeSeo({
      title: 'A reasonably sized article title',
      description: 'A'.repeat(100),
      canonicalUrl: 'https://example.com/article',
      openGraph: { image: 'https://example.com/img.png' },
      robotsValid: true,
    });
    expect(warnings).toEqual([]);
  });

  it('never throws regardless of input shape', () => {
    expect(() => analyzeSeo({ title: null, description: null, canonicalUrl: null })).not.toThrow();
  });
});
