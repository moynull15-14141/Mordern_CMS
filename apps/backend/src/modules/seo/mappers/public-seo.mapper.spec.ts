import { SeoResponseDto } from '../dto/seo-response.dto';
import { PublicSeoMapper } from './public-seo.mapper';

function buildSeoResponseDto(overrides: Partial<SeoResponseDto> = {}): SeoResponseDto {
  return {
    id: 'seo-1',
    siteId: 'site-1',
    title: 'Page Title',
    description: 'Page description',
    keywords: ['a', 'b'],
    canonicalUrl: 'https://example.com/page',
    openGraph: { image: 'og.png' },
    twitterCard: { card: 'summary' },
    schemaJson: { '@type': 'WebPage' },
    robots: { index: true },
    extraMeta: { internalNote: 'do not expose' },
    schemaJsonPretty: '{\n  "@type": "WebPage"\n}',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

describe('PublicSeoMapper', () => {
  const mapper = new PublicSeoMapper();

  it('maps rendering fields through unchanged', () => {
    const result = mapper.toPublicResponseDto(buildSeoResponseDto());
    expect(result).toEqual({
      title: 'Page Title',
      description: 'Page description',
      keywords: ['a', 'b'],
      canonicalUrl: 'https://example.com/page',
      openGraph: { image: 'og.png' },
      twitterCard: { card: 'summary' },
      schemaJson: { '@type': 'WebPage' },
      robots: { index: true },
    });
  });

  it('never exposes id, siteId, extraMeta, schemaJsonPretty, or audit fields', () => {
    const result = mapper.toPublicResponseDto(buildSeoResponseDto()) as unknown as Record<
      string,
      unknown
    >;

    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('siteId');
    expect(result).not.toHaveProperty('extraMeta');
    expect(result).not.toHaveProperty('schemaJsonPretty');
    expect(result).not.toHaveProperty('createdAt');
    expect(result).not.toHaveProperty('updatedAt');
    expect(result).not.toHaveProperty('deletedAt');
  });
});
