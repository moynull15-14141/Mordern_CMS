import { describe, expect, it } from 'vitest';
import { buildMetadataFromSeo } from './metadata.util';
import type { PublicSeo } from '../types/seo.types';

describe('buildMetadataFromSeo', () => {
  it('falls back to the provided title/canonical path when seo is null', () => {
    const metadata = buildMetadataFromSeo(null, 'About Us', '/page/about-us');
    expect(metadata.title).toBe('About Us');
    expect(metadata.alternates).toEqual({ canonical: '/page/about-us' });
  });

  it('prefers seo.title/description/canonicalUrl over the fallbacks', () => {
    const seo: PublicSeo = {
      title: 'SEO Title',
      description: 'SEO description',
      canonicalUrl: 'https://example.com/about-us',
    };
    const metadata = buildMetadataFromSeo(seo, 'About Us', '/page/about-us');
    expect(metadata.title).toBe('SEO Title');
    expect(metadata.description).toBe('SEO description');
    expect(metadata.alternates).toEqual({ canonical: 'https://example.com/about-us' });
  });

  it('extracts openGraph image/title/description defensively (unknown JSON shape)', () => {
    const seo: PublicSeo = {
      title: 'Fallback',
      openGraph: {
        title: 'OG Title',
        description: 'OG description',
        image: 'https://example.com/og.png',
      },
    };
    const metadata = buildMetadataFromSeo(seo, 'Fallback', undefined);
    expect(metadata.openGraph).toMatchObject({
      title: 'OG Title',
      description: 'OG description',
      images: ['https://example.com/og.png'],
    });
  });

  it('ignores non-string openGraph fields rather than throwing', () => {
    const seo = {
      title: 'T',
      openGraph: { title: 42, image: { nested: true } },
    } as unknown as PublicSeo;
    const metadata = buildMetadataFromSeo(seo, 'Fallback');
    expect(metadata.openGraph).toMatchObject({ title: 'T', images: undefined });
  });

  it('maps robots.index/follow booleans when present', () => {
    const seo: PublicSeo = { robots: { index: false, follow: true } };
    const metadata = buildMetadataFromSeo(seo, 'Fallback');
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it('omits robots entirely when the field has no recognizable boolean flags', () => {
    const seo: PublicSeo = { robots: { somethingElse: 'x' } };
    const metadata = buildMetadataFromSeo(seo, 'Fallback');
    expect(metadata.robots).toBeUndefined();
  });

  it('passes keywords through unchanged', () => {
    const seo: PublicSeo = { keywords: ['football', 'sport'] };
    const metadata = buildMetadataFromSeo(seo, 'Fallback');
    expect(metadata.keywords).toEqual(['football', 'sport']);
  });
});
