import { SeoMeta } from '@prisma/client';
import { SeoMapper } from './seo.mapper';

function buildSeoMeta(overrides: Partial<SeoMeta> = {}): SeoMeta {
  return {
    id: 'seo-1',
    siteId: 'site-1',
    title: 'A title',
    description: 'A description',
    keywords: ['a', 'b'],
    canonicalUrl: 'https://example.com/page',
    openGraph: { title: 'og title' },
    twitterCard: { card: 'summary' },
    schemaJson: { '@type': 'Article' },
    robots: { index: true },
    extraMeta: { custom: 'value' },
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    createdBy: 'user-1',
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    updatedBy: 'user-1',
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as SeoMeta;
}

describe('SeoMapper', () => {
  let mapper: SeoMapper;

  beforeEach(() => {
    mapper = new SeoMapper();
  });

  it('maps every field to the response DTO', () => {
    const dto = mapper.toResponseDto(buildSeoMeta());
    expect(dto).toMatchObject({
      id: 'seo-1',
      siteId: 'site-1',
      title: 'A title',
      description: 'A description',
      keywords: ['a', 'b'],
      canonicalUrl: 'https://example.com/page',
    });
    expect(dto.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(dto.deletedAt).toBeNull();
  });

  it('serializes deletedAt when set', () => {
    const dto = mapper.toResponseDto(
      buildSeoMeta({ deletedAt: new Date('2026-03-01T00:00:00.000Z') })
    );
    expect(dto.deletedAt).toBe('2026-03-01T00:00:00.000Z');
  });

  it('defaults null JSON columns to null in the response', () => {
    const dto = mapper.toResponseDto(
      buildSeoMeta({
        openGraph: null,
        twitterCard: null,
        schemaJson: null,
        robots: null,
        extraMeta: null,
      })
    );
    expect(dto.openGraph).toBeNull();
    expect(dto.twitterCard).toBeNull();
    expect(dto.schemaJson).toBeNull();
    expect(dto.robots).toBeNull();
    expect(dto.extraMeta).toBeNull();
  });

  it('pretty-prints schemaJson as a 2-space-indented string', () => {
    const dto = mapper.toResponseDto(
      buildSeoMeta({ schemaJson: { '@type': 'Article', headline: 'Hi' } })
    );
    expect(dto.schemaJsonPretty).toBe(
      JSON.stringify({ '@type': 'Article', headline: 'Hi' }, null, 2)
    );
  });

  it('schemaJsonPretty is null when schemaJson is null', () => {
    const dto = mapper.toResponseDto(buildSeoMeta({ schemaJson: null }));
    expect(dto.schemaJsonPretty).toBeNull();
  });
});
