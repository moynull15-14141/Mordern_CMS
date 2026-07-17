import { ArticleVisibility, ContentStatus } from '@prisma/client';
import { ArticleWithRelations } from '../repositories/articles.repository';
import { ArticlesMapper } from './articles.mapper';

function buildArticle(overrides: Partial<ArticleWithRelations> = {}): ArticleWithRelations {
  return {
    id: 'article-1',
    siteId: 'site-1',
    authorId: 'author-1',
    primaryCategoryId: null,
    title: 'Hello World',
    subtitle: null,
    slug: 'hello-world',
    summary: null,
    body: { blocks: [] },
    status: ContentStatus.DRAFT,
    publishedAt: null,
    scheduledAt: null,
    canonicalUrl: null,
    visibility: ArticleVisibility.PUBLIC,
    language: 'en',
    locale: 'en-US',
    seoMetaId: null,
    featuredMediaId: null,
    readingTime: null,
    wordCount: null,
    notes: null,
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-02'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    author: { id: 'author-1', penName: 'A. Writer', userId: 'user-1' } as never,
    primaryCategory: null,
    seoMeta: null,
    tags: [],
    ...overrides,
  } as ArticleWithRelations;
}

describe('ArticlesMapper', () => {
  const mapper = new ArticlesMapper();

  it('maps a bare article with no category/tags/seo', () => {
    const result = mapper.toResponseDto(buildArticle());
    expect(result.id).toBe('article-1');
    expect(result.author).toEqual({ id: 'author-1', penName: 'A. Writer', userId: 'user-1' });
    expect(result.category).toBeNull();
    expect(result.tags).toEqual([]);
    expect(result.seo).toBeNull();
    expect(result.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('maps category and tags when present', () => {
    const article = buildArticle({
      primaryCategory: { id: 'cat-1', name: 'News', slug: 'news' } as never,
      tags: [{ tag: { id: 'tag-1', name: 'Sports', slug: 'sports' }, primary: true } as never],
    });
    const result = mapper.toResponseDto(article);
    expect(result.category).toEqual({ id: 'cat-1', name: 'News', slug: 'news' });
    expect(result.tags).toEqual([{ id: 'tag-1', name: 'Sports', slug: 'sports', primary: true }]);
  });

  it('maps seoMeta when present', () => {
    const article = buildArticle({
      seoMeta: {
        title: 'SEO Title',
        description: 'SEO Description',
        canonicalUrl: null,
        keywords: ['a', 'b'],
        openGraph: null,
        twitterCard: null,
        schemaJson: null,
        robots: null,
        extraMeta: null,
      } as never,
    });
    const result = mapper.toResponseDto(article);
    expect(result.seo).toEqual(
      expect.objectContaining({
        title: 'SEO Title',
        description: 'SEO Description',
        keywords: ['a', 'b'],
      })
    );
  });

  it('maps a revision to ArticleRevisionResponseDto', () => {
    const revision = {
      version: 2,
      title: 'v2 title',
      summary: 'v2 summary',
      body: { text: 'hello' },
      status: ContentStatus.DRAFT,
      authorId: 'author-1',
      comment: 'edit note',
      createdAt: new Date('2026-01-03'),
    } as never;
    const result = mapper.toRevisionResponseDto(revision);
    expect(result.version).toBe(2);
    expect(result.createdAt).toBe('2026-01-03T00:00:00.000Z');
  });

  it('maps a revision to metadata with a computed wordCount', () => {
    const revision = {
      version: 1,
      title: 'Title',
      summary: null,
      body: { text: 'one two three' },
      status: ContentStatus.DRAFT,
      authorId: 'author-1',
      comment: null,
      createdAt: new Date('2026-01-01'),
    } as never;
    const result = mapper.toRevisionMetadataDto(revision);
    expect(result.wordCount).toBe(3);
  });
});
