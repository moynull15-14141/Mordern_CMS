import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getArticleBySlug,
  getCategoryBySlug,
  getPageBySlug,
  listArticles,
  listCategories,
} from './content-loader.service';

function mockFetchOnce(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      statusText: 'status',
      json: async () => body,
    })
  );
}

describe('content-loader.service', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getPageBySlug', () => {
    it('calls GET /public/pages/slug/:slug and adds type: "page"', async () => {
      mockFetchOnce(200, {
        success: true,
        message: 'ok',
        data: { title: 'About', slug: 'about-us', body: {}, publishedAt: null, seo: null },
        meta: {},
        errors: [],
      });

      const result = await getPageBySlug('about-us');
      expect(result).toEqual({
        type: 'page',
        title: 'About',
        slug: 'about-us',
        body: {},
        publishedAt: null,
        seo: null,
      });
      expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]).toContain(
        '/public/pages/slug/about-us'
      );
    });
  });

  describe('getArticleBySlug', () => {
    it('calls GET /public/articles/slug/:slug and adds type: "article"', async () => {
      mockFetchOnce(200, {
        success: true,
        message: 'ok',
        data: {
          title: 'Match Report',
          subtitle: null,
          slug: 'match-report',
          summary: null,
          publishedAt: null,
          readingTime: null,
          author: { penName: 'Jane' },
          category: null,
          tags: [],
          body: {},
          wordCount: null,
          language: 'en',
          locale: 'en-US',
          canonicalUrl: null,
          seo: null,
        },
        meta: {},
        errors: [],
      });

      const result = await getArticleBySlug('match-report');
      expect(result.type).toBe('article');
      expect(result.slug).toBe('match-report');
    });
  });

  describe('listArticles', () => {
    it('builds a query string and returns articles + pagination', async () => {
      mockFetchOnce(200, {
        success: true,
        message: 'ok',
        data: [],
        meta: { pagination: { page: 2, limit: 5, total: 0, hasNext: false, hasPrevious: true } },
        errors: [],
      });

      const result = await listArticles({
        page: 2,
        limit: 5,
        search: 'derby',
        sortBy: 'title',
        sortOrder: 'asc',
      });

      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl).toContain('/public/articles?');
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('limit=5');
      expect(calledUrl).toContain('search=derby');
      expect(calledUrl).toContain('sortBy=title');
      expect(calledUrl).toContain('sortOrder=asc');
      expect(result.pagination.total).toBe(0);
    });

    it('omits undefined params from the query string', async () => {
      mockFetchOnce(200, {
        success: true,
        message: 'ok',
        data: [],
        meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
        errors: [],
      });

      await listArticles();

      const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(calledUrl.endsWith('/public/articles')).toBe(true);
    });
  });

  describe('getCategoryBySlug', () => {
    it('calls GET /public/categories/slug/:slug and adds type: "category"', async () => {
      mockFetchOnce(200, {
        success: true,
        message: 'ok',
        data: { name: 'Football', slug: 'football', description: null, articleCount: 2, seo: null },
        meta: {},
        errors: [],
      });

      const result = await getCategoryBySlug('football');
      expect(result).toEqual({
        type: 'category',
        name: 'Football',
        slug: 'football',
        description: null,
        articleCount: 2,
        seo: null,
      });
    });
  });

  describe('listCategories', () => {
    it('maps every item to include type: "category"', async () => {
      mockFetchOnce(200, {
        success: true,
        message: 'ok',
        data: [
          { name: 'Football', slug: 'football', description: null, articleCount: 1, seo: null },
        ],
        meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
        errors: [],
      });

      const result = await listCategories();
      expect(result.categories[0].type).toBe('category');
    });
  });
});
