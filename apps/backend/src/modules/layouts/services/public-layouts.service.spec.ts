import { BadRequestException } from '@nestjs/common';
import { LayoutAssignmentsRepository } from '../repositories/layout-assignments.repository';
import { PublicLayoutsService } from './public-layouts.service';
import type { PublicPagesService } from '../../pages/services/public-pages.service';
import type { PublicArticlesService } from '../../articles/services/public-articles.service';
import type { PublicCategoriesService } from '../../categories/services/public-categories.service';

function buildService() {
  const repository = {
    getDefaultSite: jest.fn().mockResolvedValue({ id: 'site-1' }),
    findPublishedByTarget: jest.fn().mockResolvedValue(null),
  } as unknown as LayoutAssignmentsRepository;

  const publicPagesService = {
    resolvePublishedIdBySlug: jest.fn().mockResolvedValue('page-1'),
  } as unknown as PublicPagesService;
  const publicArticlesService = {
    resolvePublishedIdBySlug: jest.fn().mockResolvedValue('article-1'),
  } as unknown as PublicArticlesService;
  const publicCategoriesService = {
    resolvePublishedIdBySlug: jest.fn().mockResolvedValue('cat-1'),
  } as unknown as PublicCategoriesService;

  const service = new PublicLayoutsService(
    repository,
    publicPagesService,
    publicArticlesService,
    publicCategoriesService
  );

  return {
    service,
    repository,
    publicPagesService,
    publicArticlesService,
    publicCategoriesService,
  };
}

describe('PublicLayoutsService', () => {
  describe('resolveLayoutForContent', () => {
    it('throws BadRequestException when slug is missing for a non-home content type', async () => {
      const { service } = buildService();
      await expect(service.resolveLayoutForContent('page', undefined)).rejects.toThrow(
        BadRequestException
      );
    });

    it('never requires a slug for "home"', async () => {
      const { service } = buildService();
      await expect(service.resolveLayoutForContent('home', undefined)).resolves.toBeDefined();
    });

    it('resolves the page slug to an id via PublicPagesService before querying', async () => {
      const { service, repository, publicPagesService } = buildService();
      await service.resolveLayoutForContent('page', 'about-us');
      expect(publicPagesService.resolvePublishedIdBySlug).toHaveBeenCalledWith('about-us');
      expect(repository.findPublishedByTarget).toHaveBeenCalledWith(
        'site-1',
        expect.objectContaining({ contentType: 'PAGE', pageId: 'page-1' })
      );
    });

    it('resolves the article slug via PublicArticlesService', async () => {
      const { service, publicArticlesService } = buildService();
      await service.resolveLayoutForContent('article', 'match-report');
      expect(publicArticlesService.resolvePublishedIdBySlug).toHaveBeenCalledWith('match-report');
    });

    it('resolves the category slug via PublicCategoriesService', async () => {
      const { service, publicCategoriesService } = buildService();
      await service.resolveLayoutForContent('category', 'football');
      expect(publicCategoriesService.resolvePublishedIdBySlug).toHaveBeenCalledWith('football');
    });

    it('returns both fields null when no assignment exists at either tier', async () => {
      const { service } = buildService();
      const result = await service.resolveLayoutForContent('page', 'about-us');
      expect(result).toEqual({ explicitLayoutPreset: null, contentDefaultLayoutPreset: null });
    });

    it('returns the explicit-tier preset independently of the content-default tier', async () => {
      const { service, repository } = buildService();
      (repository.findPublishedByTarget as jest.Mock).mockImplementation((_siteId, target) => {
        if (target.pageId === 'page-1') {
          return Promise.resolve({ layout: { layoutPreset: 'sidebar-left' } });
        }
        return Promise.resolve(null);
      });

      const result = await service.resolveLayoutForContent('page', 'about-us');

      expect(result).toEqual({
        explicitLayoutPreset: 'sidebar-left',
        contentDefaultLayoutPreset: null,
      });
    });

    it('returns the content-default tier when no explicit assignment exists', async () => {
      const { service, repository } = buildService();
      (repository.findPublishedByTarget as jest.Mock).mockImplementation((_siteId, target) => {
        if (target.pageId === null) {
          return Promise.resolve({ layout: { layoutPreset: 'boxed' } });
        }
        return Promise.resolve(null);
      });

      const result = await service.resolveLayoutForContent('page', 'about-us');

      expect(result).toEqual({ explicitLayoutPreset: null, contentDefaultLayoutPreset: 'boxed' });
    });

    it('for "home", resolves both fields from the single HOMEPAGE assignment (no per-instance entity exists)', async () => {
      const { service, repository } = buildService();
      (repository.findPublishedByTarget as jest.Mock).mockResolvedValue({
        layout: { layoutPreset: 'full-width' },
      });

      const result = await service.resolveLayoutForContent('home', undefined);

      expect(result).toEqual({
        explicitLayoutPreset: 'full-width',
        contentDefaultLayoutPreset: 'full-width',
      });
      expect(repository.findPublishedByTarget).toHaveBeenCalledTimes(1);
    });
  });
});
