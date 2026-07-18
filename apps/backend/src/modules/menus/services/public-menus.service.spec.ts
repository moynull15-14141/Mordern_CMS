import { MenuItemOpenMode, MenuItemTargetType, MenuStatus } from '@prisma/client';
import { MenusRepository, MenuWithItems } from '../repositories/menus.repository';
import { MenusMapper } from '../mappers/menus.mapper';
import { MenuNotFoundException } from '../exceptions/menu.exceptions';
import { PublicMenusService } from './public-menus.service';

function buildMenu(overrides: Partial<MenuWithItems> = {}): MenuWithItems {
  return {
    id: 'menu-1',
    siteId: 'site-1',
    name: 'Header',
    slug: 'header',
    location: 'header',
    status: MenuStatus.PUBLISHED,
    createdAt: new Date('2026-01-01'),
    createdBy: null,
    updatedAt: new Date('2026-01-01'),
    updatedBy: null,
    deletedAt: null,
    deletedBy: null,
    items: [
      {
        id: 'item-1',
        menuId: 'menu-1',
        parentId: null,
        label: 'Home',
        targetType: MenuItemTargetType.EXTERNAL_URL,
        pageId: null,
        articleId: null,
        categoryId: null,
        url: 'https://example.com',
        openMode: MenuItemOpenMode.SELF,
        icon: null,
        cssClass: null,
        sortOrder: 0,
        layoutMeta: null,
        createdAt: new Date('2026-01-01'),
        createdBy: null,
        updatedAt: new Date('2026-01-01'),
        updatedBy: null,
        deletedAt: null,
        deletedBy: null,
      },
    ],
    ...overrides,
  } as MenuWithItems;
}

function buildService() {
  const repository = {
    getDefaultSite: jest.fn().mockResolvedValue({ id: 'site-1' }),
    findPublishedBySlug: jest.fn(),
    findPublishedByLocation: jest.fn(),
    findPagesByIds: jest.fn().mockResolvedValue([]),
    findArticlesByIds: jest.fn().mockResolvedValue([]),
    findCategoriesByIds: jest.fn().mockResolvedValue([]),
  } as unknown as MenusRepository;

  const service = new PublicMenusService(repository, new MenusMapper());
  return { service, repository };
}

describe('PublicMenusService', () => {
  describe('getMenuByLocation', () => {
    it('returns the public-shaped menu for a matching PUBLISHED menu', async () => {
      const { service, repository } = buildService();
      (repository.findPublishedByLocation as jest.Mock).mockResolvedValue(buildMenu());

      const result = await service.getMenuByLocation('header');

      expect(repository.findPublishedByLocation).toHaveBeenCalledWith('header', 'site-1');
      expect(result.slug).toBe('header');
      expect(result.items).toHaveLength(1);
    });

    it('throws MenuNotFoundException when no PUBLISHED menu matches the location', async () => {
      const { service, repository } = buildService();
      (repository.findPublishedByLocation as jest.Mock).mockResolvedValue(null);

      await expect(service.getMenuByLocation('missing')).rejects.toThrow(MenuNotFoundException);
    });

    it('never exposes an isBroken flag or internal ids in the result', async () => {
      const { service, repository } = buildService();
      (repository.findPublishedByLocation as jest.Mock).mockResolvedValue(buildMenu());

      const result = await service.getMenuByLocation('header');

      const item = result.items[0] as unknown as Record<string, unknown>;
      expect(item).not.toHaveProperty('isBroken');
      expect(item).not.toHaveProperty('pageId');
    });
  });

  describe('getMenuBySlug', () => {
    it('returns the public-shaped menu for a matching PUBLISHED slug', async () => {
      const { service, repository } = buildService();
      (repository.findPublishedBySlug as jest.Mock).mockResolvedValue(buildMenu());

      const result = await service.getMenuBySlug('header');

      expect(repository.findPublishedBySlug).toHaveBeenCalledWith('header', 'site-1');
      expect(result.name).toBe('Header');
    });

    it('throws MenuNotFoundException when no PUBLISHED menu matches the slug', async () => {
      const { service, repository } = buildService();
      (repository.findPublishedBySlug as jest.Mock).mockResolvedValue(null);

      await expect(service.getMenuBySlug('missing')).rejects.toThrow(MenuNotFoundException);
    });
  });

  describe('URL resolution (Backend Milestone 11.4)', () => {
    function itemWith(overrides: Record<string, unknown>) {
      return {
        id: 'item-1',
        menuId: 'menu-1',
        parentId: null,
        label: 'Item',
        targetType: MenuItemTargetType.PAGE,
        pageId: null,
        articleId: null,
        categoryId: null,
        url: null,
        openMode: MenuItemOpenMode.SELF,
        icon: null,
        cssClass: null,
        sortOrder: 0,
        layoutMeta: null,
        createdAt: new Date('2026-01-01'),
        createdBy: null,
        updatedAt: new Date('2026-01-01'),
        updatedBy: null,
        deletedAt: null,
        deletedBy: null,
        ...overrides,
      };
    }

    it('batch-fetches page slugs once (not per item) and resolves /{slug}', async () => {
      const { service, repository } = buildService();
      (repository.findPagesByIds as jest.Mock).mockResolvedValue([{ id: 'page-1', slug: 'about' }]);
      (repository.findPublishedByLocation as jest.Mock).mockResolvedValue(
        buildMenu({
          items: [
            itemWith({ id: 'a', targetType: 'PAGE', pageId: 'page-1' }),
            itemWith({ id: 'b', targetType: 'PAGE', pageId: 'page-1' }),
          ],
        })
      );

      const result = await service.getMenuByLocation('header');

      expect(repository.findPagesByIds).toHaveBeenCalledTimes(1);
      expect(repository.findPagesByIds).toHaveBeenCalledWith(['page-1'], 'site-1');
      expect(result.items.every((item) => item.resolvedUrl === '/about')).toBe(true);
    });

    it('resolves an ARTICLE target to /blog/{slug}', async () => {
      const { service, repository } = buildService();
      (repository.findArticlesByIds as jest.Mock).mockResolvedValue([
        { id: 'article-1', slug: 'seo-guide' },
      ]);
      (repository.findPublishedBySlug as jest.Mock).mockResolvedValue(
        buildMenu({ items: [itemWith({ targetType: 'ARTICLE', articleId: 'article-1' })] })
      );

      const result = await service.getMenuBySlug('header');

      expect(result.items[0].resolvedUrl).toBe('/blog/seo-guide');
    });

    it('resolves a CATEGORY target to /category/{slug}', async () => {
      const { service, repository } = buildService();
      (repository.findCategoriesByIds as jest.Mock).mockResolvedValue([
        { id: 'cat-1', slug: 'travel' },
      ]);
      (repository.findPublishedBySlug as jest.Mock).mockResolvedValue(
        buildMenu({ items: [itemWith({ targetType: 'CATEGORY', categoryId: 'cat-1' })] })
      );

      const result = await service.getMenuBySlug('header');

      expect(result.items[0].resolvedUrl).toBe('/category/travel');
    });

    it('omits an item whose internal target cannot be resolved (deleted/missing)', async () => {
      const { service, repository } = buildService();
      (repository.findPagesByIds as jest.Mock).mockResolvedValue([]); // target not found
      (repository.findPublishedBySlug as jest.Mock).mockResolvedValue(
        buildMenu({ items: [itemWith({ targetType: 'PAGE', pageId: 'deleted-page' })] })
      );

      const result = await service.getMenuBySlug('header');

      expect(result.items).toHaveLength(0);
    });

    it('does not call findPagesByIds/findArticlesByIds/findCategoriesByIds when the menu has no matching-type items', async () => {
      const { service, repository } = buildService();
      (repository.findPublishedBySlug as jest.Mock).mockResolvedValue(
        buildMenu({ items: [itemWith({ targetType: 'EXTERNAL_URL', url: 'https://x.com' })] })
      );

      await service.getMenuBySlug('header');

      expect(repository.findPagesByIds).toHaveBeenCalledWith([], 'site-1');
      expect(repository.findArticlesByIds).toHaveBeenCalledWith([], 'site-1');
      expect(repository.findCategoriesByIds).toHaveBeenCalledWith([], 'site-1');
    });
  });
});
