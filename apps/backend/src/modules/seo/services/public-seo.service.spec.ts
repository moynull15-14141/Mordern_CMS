import { SeoService } from './seo.service';
import { PublicSeoMapper } from '../mappers/public-seo.mapper';
import { PublicSeoService } from './public-seo.service';
import { PublicPagesService } from '../../pages/services/public-pages.service';
import { PublicArticlesService } from '../../articles/services/public-articles.service';
import { PublicCategoriesService } from '../../categories/services/public-categories.service';
import { PageNotFoundException } from '../../pages/exceptions/page.exceptions';
import { SeoResponseDto } from '../dto/seo-response.dto';

function buildSeoResponseDto(overrides: Partial<SeoResponseDto> = {}): SeoResponseDto {
  return {
    id: 'seo-1',
    siteId: 'site-1',
    title: 'Title',
    description: null,
    keywords: [],
    canonicalUrl: null,
    openGraph: null,
    twitterCard: null,
    schemaJson: null,
    robots: null,
    extraMeta: null,
    schemaJsonPretty: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

function buildService() {
  const seoService = {
    getSeoForPage: jest.fn(),
    getSeoForArticle: jest.fn(),
    getSeoForCategory: jest.fn(),
  } as unknown as SeoService;
  const publicPagesService = {
    resolvePublishedIdBySlug: jest.fn(),
  } as unknown as PublicPagesService;
  const publicArticlesService = {
    resolvePublishedIdBySlug: jest.fn(),
  } as unknown as PublicArticlesService;
  const publicCategoriesService = {
    resolvePublishedIdBySlug: jest.fn(),
  } as unknown as PublicCategoriesService;

  const service = new PublicSeoService(
    seoService,
    publicPagesService,
    publicArticlesService,
    publicCategoriesService,
    new PublicSeoMapper()
  );

  return {
    service,
    seoService,
    publicPagesService,
    publicArticlesService,
    publicCategoriesService,
  };
}

describe('PublicSeoService', () => {
  it('resolves a page slug to an id via PublicPagesService, then fetches SEO by that id', async () => {
    const { service, seoService, publicPagesService } = buildService();
    (publicPagesService.resolvePublishedIdBySlug as jest.Mock).mockResolvedValue('page-1');
    (seoService.getSeoForPage as jest.Mock).mockResolvedValue(
      buildSeoResponseDto({ title: 'About' })
    );

    const result = await service.getSeoForEntity('page', 'about-us');

    expect(publicPagesService.resolvePublishedIdBySlug).toHaveBeenCalledWith('about-us');
    expect(seoService.getSeoForPage).toHaveBeenCalledWith('page-1');
    expect(result.title).toBe('About');
  });

  it('resolves an article slug to an id via PublicArticlesService, then fetches SEO by that id', async () => {
    const { service, seoService, publicArticlesService } = buildService();
    (publicArticlesService.resolvePublishedIdBySlug as jest.Mock).mockResolvedValue('article-1');
    (seoService.getSeoForArticle as jest.Mock).mockResolvedValue(buildSeoResponseDto());

    await service.getSeoForEntity('article', 'match-report');

    expect(publicArticlesService.resolvePublishedIdBySlug).toHaveBeenCalledWith('match-report');
    expect(seoService.getSeoForArticle).toHaveBeenCalledWith('article-1');
  });

  it('resolves a category slug to an id via PublicCategoriesService, then fetches SEO by that id', async () => {
    const { service, seoService, publicCategoriesService } = buildService();
    (publicCategoriesService.resolvePublishedIdBySlug as jest.Mock).mockResolvedValue('cat-1');
    (seoService.getSeoForCategory as jest.Mock).mockResolvedValue(buildSeoResponseDto());

    await service.getSeoForEntity('category', 'football');

    expect(publicCategoriesService.resolvePublishedIdBySlug).toHaveBeenCalledWith('football');
    expect(seoService.getSeoForCategory).toHaveBeenCalledWith('cat-1');
  });

  it('propagates the underlying not-found exception when slug resolution fails (no separate error invented)', async () => {
    const { service, publicPagesService } = buildService();
    (publicPagesService.resolvePublishedIdBySlug as jest.Mock).mockRejectedValue(
      new PageNotFoundException('nope')
    );

    await expect(service.getSeoForEntity('page', 'nope')).rejects.toThrow(PageNotFoundException);
  });
});
