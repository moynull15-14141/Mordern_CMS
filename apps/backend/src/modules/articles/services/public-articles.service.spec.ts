import { ArticleVisibility, ContentStatus } from '@prisma/client';
import { ArticlesService } from './articles.service';
import { PublicArticlesMapper } from '../mappers/public-articles.mapper';
import { PublicArticlesService } from './public-articles.service';
import { ArticleNotFoundException } from '../exceptions/article.exceptions';
import { ArticleResponseDto } from '../dto/article-response.dto';
import { PublicArticleQueryDto } from '../dto/public-article-query.dto';
import { ArticleSortField } from '../constants/article.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';

function buildArticleResponseDto(overrides: Partial<ArticleResponseDto> = {}): ArticleResponseDto {
  return {
    id: 'article-1',
    title: 'Match Report',
    subtitle: null,
    slug: 'match-report',
    summary: null,
    body: {},
    status: ContentStatus.PUBLISHED,
    publishedAt: '2026-01-01T00:00:00.000Z',
    scheduledAt: null,
    visibility: ArticleVisibility.PUBLIC,
    language: 'en',
    locale: 'en-US',
    canonicalUrl: null,
    readingTime: 3,
    wordCount: 600,
    notes: null,
    featuredMediaId: null,
    author: { id: 'author-1', penName: 'Jane Doe', userId: null },
    category: null,
    tags: [],
    seo: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

function buildService() {
  const articlesService = {
    listArticles: jest.fn(),
    getArticleBySlug: jest.fn(),
  } as unknown as ArticlesService;
  const service = new PublicArticlesService(articlesService, new PublicArticlesMapper());
  return { service, articlesService };
}

describe('PublicArticlesService', () => {
  describe('listArticles', () => {
    it('forces status=PUBLISHED and visibility=PUBLIC regardless of query input', async () => {
      const { service, articlesService } = buildService();
      (articlesService.listArticles as jest.Mock).mockResolvedValue({
        items: [buildArticleResponseDto()],
        pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false },
      });

      const query: PublicArticleQueryDto = {
        page: 1,
        limit: 20,
        search: 'derby',
        sortBy: ArticleSortField.TITLE,
        sortOrder: SortOrder.ASC,
      };
      const result = await service.listArticles(query);

      expect(articlesService.listArticles).toHaveBeenCalledWith({
        filters: {
          status: ContentStatus.PUBLISHED,
          visibility: ArticleVisibility.PUBLIC,
          search: 'derby',
        },
        sortBy: ArticleSortField.TITLE,
        sortOrder: SortOrder.ASC,
        page: 1,
        limit: 20,
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).not.toHaveProperty('body');
    });
  });

  describe('getArticleBySlug', () => {
    it('returns the public shape for a PUBLISHED + PUBLIC article', async () => {
      const { service, articlesService } = buildService();
      (articlesService.getArticleBySlug as jest.Mock).mockResolvedValue(buildArticleResponseDto());

      const result = await service.getArticleBySlug('match-report');
      expect(result.slug).toBe('match-report');
    });

    it('returns the public shape for a PUBLISHED + UNLISTED article (direct link)', async () => {
      const { service, articlesService } = buildService();
      (articlesService.getArticleBySlug as jest.Mock).mockResolvedValue(
        buildArticleResponseDto({ visibility: ArticleVisibility.UNLISTED })
      );

      const result = await service.getArticleBySlug('match-report');
      expect(result.slug).toBe('match-report');
    });

    it('throws ArticleNotFoundException for a PRIVATE article even if PUBLISHED', async () => {
      const { service, articlesService } = buildService();
      (articlesService.getArticleBySlug as jest.Mock).mockResolvedValue(
        buildArticleResponseDto({ visibility: ArticleVisibility.PRIVATE })
      );

      await expect(service.getArticleBySlug('match-report')).rejects.toThrow(
        ArticleNotFoundException
      );
    });

    it('throws ArticleNotFoundException for a DRAFT article', async () => {
      const { service, articlesService } = buildService();
      (articlesService.getArticleBySlug as jest.Mock).mockResolvedValue(
        buildArticleResponseDto({ status: ContentStatus.DRAFT })
      );

      await expect(service.getArticleBySlug('match-report')).rejects.toThrow(
        ArticleNotFoundException
      );
    });

    it('throws ArticleNotFoundException for a SCHEDULED article', async () => {
      const { service, articlesService } = buildService();
      (articlesService.getArticleBySlug as jest.Mock).mockResolvedValue(
        buildArticleResponseDto({ status: ContentStatus.SCHEDULED })
      );

      await expect(service.getArticleBySlug('match-report')).rejects.toThrow(
        ArticleNotFoundException
      );
    });

    it('propagates ArticleNotFoundException when the underlying service throws', async () => {
      const { service, articlesService } = buildService();
      (articlesService.getArticleBySlug as jest.Mock).mockRejectedValue(
        new ArticleNotFoundException('nope')
      );

      await expect(service.getArticleBySlug('nope')).rejects.toThrow(ArticleNotFoundException);
    });
  });

  describe('resolvePublishedIdBySlug', () => {
    it('returns the id of a PUBLISHED + PUBLIC article (used by the SEO composition endpoint)', async () => {
      const { service, articlesService } = buildService();
      (articlesService.getArticleBySlug as jest.Mock).mockResolvedValue(
        buildArticleResponseDto({ id: 'article-42' })
      );

      await expect(service.resolvePublishedIdBySlug('match-report')).resolves.toBe('article-42');
    });

    it('applies the same visibility gate as getArticleBySlug', async () => {
      const { service, articlesService } = buildService();
      (articlesService.getArticleBySlug as jest.Mock).mockResolvedValue(
        buildArticleResponseDto({ visibility: ArticleVisibility.PRIVATE })
      );

      await expect(service.resolvePublishedIdBySlug('match-report')).rejects.toThrow(
        ArticleNotFoundException
      );
    });
  });
});
