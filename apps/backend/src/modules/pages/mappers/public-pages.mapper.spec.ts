import { ContentStatus } from '@prisma/client';
import { PageResponseDto } from '../dto/page-response.dto';
import { PublicPagesMapper } from './public-pages.mapper';

function buildPageResponseDto(overrides: Partial<PageResponseDto> = {}): PageResponseDto {
  return {
    id: 'page-1',
    title: 'About Us',
    slug: 'about-us',
    body: { type: 'doc' },
    status: ContentStatus.PUBLISHED,
    publishedAt: '2026-01-01T00:00:00.000Z',
    seo: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

describe('PublicPagesMapper', () => {
  const mapper = new PublicPagesMapper();

  it('maps title/slug/body/publishedAt through unchanged', () => {
    const dto = buildPageResponseDto();
    const result = mapper.toPublicResponseDto(dto);

    expect(result.title).toBe('About Us');
    expect(result.slug).toBe('about-us');
    expect(result.body).toEqual({ type: 'doc' });
    expect(result.publishedAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('never exposes id or any audit field', () => {
    const dto = buildPageResponseDto();
    const result = mapper.toPublicResponseDto(dto) as unknown as Record<string, unknown>;

    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('status');
    expect(result).not.toHaveProperty('createdAt');
    expect(result).not.toHaveProperty('updatedAt');
    expect(result).not.toHaveProperty('deletedAt');
    expect(result).not.toHaveProperty('createdBy');
    expect(result).not.toHaveProperty('updatedBy');
    expect(result).not.toHaveProperty('deletedBy');
  });

  it('maps seo fields but omits extraMeta', () => {
    const dto = buildPageResponseDto({
      seo: {
        title: 'About',
        description: 'Learn more',
        canonicalUrl: 'https://example.com/about-us',
        keywords: ['about'],
        openGraph: { image: 'og.png' },
        twitterCard: { card: 'summary' },
        schemaJson: { '@type': 'WebPage' },
        robots: { index: true },
        extraMeta: { internalNote: 'do not expose' },
      },
    });

    const result = mapper.toPublicResponseDto(dto);

    expect(result.seo).toEqual({
      title: 'About',
      description: 'Learn more',
      canonicalUrl: 'https://example.com/about-us',
      keywords: ['about'],
      openGraph: { image: 'og.png' },
      twitterCard: { card: 'summary' },
      schemaJson: { '@type': 'WebPage' },
      robots: { index: true },
    });
    expect(result.seo).not.toHaveProperty('extraMeta');
  });

  it('maps a null seo through as null', () => {
    const dto = buildPageResponseDto({ seo: null });
    const result = mapper.toPublicResponseDto(dto);
    expect(result.seo).toBeNull();
  });
});
