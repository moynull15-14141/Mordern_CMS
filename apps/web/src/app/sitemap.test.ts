import { afterEach, describe, expect, it, vi } from 'vitest';
import sitemap from './sitemap';
import * as contentLoader from '@/features/public/services/content-loader.service';

vi.mock('@/features/public/services/content-loader.service', () => ({
  listPages: vi.fn(),
  listArticles: vi.fn(),
  listCategories: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('sitemap', () => {
  it('includes the homepage, blog list, and every published page/article/category', async () => {
    vi.mocked(contentLoader.listPages).mockResolvedValue({
      pages: [
        {
          title: 'About',
          slug: 'about-us',
          publishedAt: null,
          updatedAt: '2026-01-02T00:00:00.000Z',
          noIndex: false,
        },
      ],
      pagination: { page: 1, limit: 5000, total: 1, hasNext: false, hasPrevious: false },
    });
    vi.mocked(contentLoader.listArticles).mockResolvedValue({
      articles: [
        {
          title: 'Match Report',
          subtitle: null,
          slug: 'match-report',
          summary: null,
          publishedAt: '2026-01-01T00:00:00.000Z',
          readingTime: null,
          author: { penName: 'Jane' },
          category: null,
          tags: [],
          updatedAt: '2026-01-03T00:00:00.000Z',
          noIndex: false,
        },
      ],
      pagination: { page: 1, limit: 5000, total: 1, hasNext: false, hasPrevious: false },
    });
    vi.mocked(contentLoader.listCategories).mockResolvedValue({
      categories: [
        {
          type: 'category',
          name: 'Football',
          slug: 'football',
          description: null,
          articleCount: 1,
          seo: null,
          updatedAt: '2026-01-04T00:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 5000, total: 1, hasNext: false, hasPrevious: false },
    });

    const result = await sitemap();
    const urls = result.map((entry) => entry.url);

    expect(urls).toContain('http://localhost:3002');
    expect(urls).toContain('http://localhost:3002/blog');
    expect(urls).toContain('http://localhost:3002/page/about-us');
    expect(urls).toContain('http://localhost:3002/blog/match-report');
    expect(urls).toContain('http://localhost:3002/category/football');
  });

  it('excludes a page marked noIndex', async () => {
    vi.mocked(contentLoader.listPages).mockResolvedValue({
      pages: [
        {
          title: 'Internal',
          slug: 'internal-only',
          publishedAt: null,
          updatedAt: '2026-01-02T00:00:00.000Z',
          noIndex: true,
        },
      ],
      pagination: { page: 1, limit: 5000, total: 1, hasNext: false, hasPrevious: false },
    });
    vi.mocked(contentLoader.listArticles).mockResolvedValue({
      articles: [],
      pagination: { page: 1, limit: 5000, total: 0, hasNext: false, hasPrevious: false },
    });
    vi.mocked(contentLoader.listCategories).mockResolvedValue({
      categories: [],
      pagination: { page: 1, limit: 5000, total: 0, hasNext: false, hasPrevious: false },
    });

    const result = await sitemap();
    const urls = result.map((entry) => entry.url);
    expect(urls).not.toContain('http://localhost:3002/page/internal-only');
  });

  it('excludes a category marked noindex via seo.robots.index', async () => {
    vi.mocked(contentLoader.listPages).mockResolvedValue({
      pages: [],
      pagination: { page: 1, limit: 5000, total: 0, hasNext: false, hasPrevious: false },
    });
    vi.mocked(contentLoader.listArticles).mockResolvedValue({
      articles: [],
      pagination: { page: 1, limit: 5000, total: 0, hasNext: false, hasPrevious: false },
    });
    vi.mocked(contentLoader.listCategories).mockResolvedValue({
      categories: [
        {
          type: 'category',
          name: 'Hidden',
          slug: 'hidden',
          description: null,
          articleCount: 0,
          seo: { robots: { index: false } },
          updatedAt: '2026-01-04T00:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 5000, total: 1, hasNext: false, hasPrevious: false },
    });

    const result = await sitemap();
    const urls = result.map((entry) => entry.url);
    expect(urls).not.toContain('http://localhost:3002/category/hidden');
  });
});
