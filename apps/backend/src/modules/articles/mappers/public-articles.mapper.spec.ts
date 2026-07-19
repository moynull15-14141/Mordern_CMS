import { ArticleVisibility, ContentStatus } from '@prisma/client';
import { ArticleResponseDto } from '../dto/article-response.dto';
import { PublicArticlesMapper } from './public-articles.mapper';

function buildArticleResponseDto(overrides: Partial<ArticleResponseDto> = {}): ArticleResponseDto {
  return {
    id: 'article-1',
    title: 'Match Report: City Wins',
    subtitle: 'A thrilling finish',
    slug: 'match-report-city-wins',
    summary: 'City won 2-1.',
    body: { type: 'doc' },
    status: ContentStatus.PUBLISHED,
    publishedAt: '2026-01-01T00:00:00.000Z',
    scheduledAt: null,
    visibility: ArticleVisibility.PUBLIC,
    language: 'en',
    locale: 'en-US',
    canonicalUrl: null,
    readingTime: 4,
    wordCount: 800,
    notes: 'internal editorial note',
    featuredMediaId: 'media-1',
    author: { id: 'author-1', penName: 'Jane Doe', userId: 'user-1' },
    category: { id: 'cat-1', name: 'Football', slug: 'football' },
    tags: [{ id: 'tag-1', name: 'Derby', slug: 'derby', primary: true }],
    seo: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

describe('PublicArticlesMapper', () => {
  const mapper = new PublicArticlesMapper();

  it('toListItemDto maps rendering fields and omits ids', () => {
    const result = mapper.toListItemDto(buildArticleResponseDto()) as unknown as Record<
      string,
      unknown
    >;

    expect(result).toMatchObject({
      title: 'Match Report: City Wins',
      slug: 'match-report-city-wins',
      author: { penName: 'Jane Doe' },
      category: { name: 'Football', slug: 'football' },
      tags: [{ name: 'Derby', slug: 'derby', primary: true }],
    });
    expect(result.author as Record<string, unknown>).not.toHaveProperty('id');
    expect(result.author as Record<string, unknown>).not.toHaveProperty('userId');
    expect(result.category as Record<string, unknown>).not.toHaveProperty('id');
    expect((result.tags as Record<string, unknown>[])[0]).not.toHaveProperty('id');
  });

  it('toListItemDto never exposes body, notes, or internal ids', () => {
    const result = mapper.toListItemDto(buildArticleResponseDto()) as unknown as Record<
      string,
      unknown
    >;

    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('body');
    expect(result).not.toHaveProperty('notes');
    expect(result).not.toHaveProperty('featuredMediaId');
    expect(result).not.toHaveProperty('status');
    expect(result).not.toHaveProperty('visibility');
  });

  it('toPublicResponseDto includes body/language/locale/canonicalUrl/seo on top of the list fields', () => {
    const result = mapper.toPublicResponseDto(
      buildArticleResponseDto({
        seo: {
          title: 'SEO Title',
          keywords: [],
          extraMeta: { secret: true },
        },
      })
    );

    expect(result.body).toEqual({ type: 'doc' });
    expect(result.language).toBe('en');
    expect(result.locale).toBe('en-US');
    expect(result.wordCount).toBe(800);
    expect(result.seo?.title).toBe('SEO Title');
    expect(result.seo).not.toHaveProperty('extraMeta');
  });

  it('never exposes audit fields, scheduledAt, or notes in the detail shape', () => {
    const result = mapper.toPublicResponseDto(buildArticleResponseDto()) as unknown as Record<
      string,
      unknown
    >;

    expect(result).not.toHaveProperty('createdAt');
    expect(result).not.toHaveProperty('updatedAt');
    expect(result).not.toHaveProperty('deletedAt');
    expect(result).not.toHaveProperty('scheduledAt');
    expect(result).not.toHaveProperty('notes');
  });
});
