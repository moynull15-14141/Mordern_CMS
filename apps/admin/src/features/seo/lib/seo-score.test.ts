import { describe, expect, it } from 'vitest';
import { computeSeoScore } from './seo-score';

describe('computeSeoScore', () => {
  it('scores an empty SEO object as poor with 0% completion', () => {
    const result = computeSeoScore({});
    expect(result.status).toBe('poor');
    expect(result.completion).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('scores a fully-filled SEO object as excellent', () => {
    const result = computeSeoScore({
      title: 'A well sized SEO title for the page',
      description:
        'A meta description that is comfortably between fifty and one hundred sixty characters long for good SEO.',
      canonicalUrl: 'https://example.com/article',
      openGraph: {
        title: 'OG title',
        description: 'OG desc',
        image: 'https://example.com/img.jpg',
      },
      twitterCard: {
        card: 'summary_large_image',
        title: 'T',
        description: 'D',
        image: 'https://x/y.jpg',
      },
      robots: { index: true, follow: true },
      schemaJson: { '@type': 'Article' },
      slug: 'a-well-sized-title',
      featuredImage: 'https://example.com/img.jpg',
      featuredImageAlt: 'Descriptive alt text',
    });
    expect(result.status).toBe('excellent');
    expect(result.completion).toBe(100);
    expect(result.errors).toHaveLength(0);
  });

  it('flags a too-short title as a failing critical check', () => {
    const result = computeSeoScore({ title: 'Short' });
    const titleCheck = result.checks.find((c) => c.id === 'title');
    expect(titleCheck?.passed).toBe(false);
    expect(titleCheck?.message).toMatch(/too short/i);
  });

  it('flags a non-hyphenated slug as failing', () => {
    const result = computeSeoScore({ slug: 'My_Bad Slug' });
    const slugCheck = result.checks.find((c) => c.id === 'slug');
    expect(slugCheck?.passed).toBe(false);
  });
});
