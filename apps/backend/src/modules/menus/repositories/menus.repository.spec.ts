import { MenuSortField } from '../constants/menu.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { MenusRepository } from './menus.repository';

function buildPrismaMock() {
  const prisma = {
    site: { findFirst: jest.fn() },
    menu: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      update: jest.fn(),
    },
    menuItem: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      update: jest.fn(),
    },
    page: { findFirst: jest.fn(), findMany: jest.fn().mockResolvedValue([]) },
    article: { findFirst: jest.fn(), findMany: jest.fn().mockResolvedValue([]) },
    category: { findFirst: jest.fn(), findMany: jest.fn().mockResolvedValue([]) },
  } as unknown as PrismaService;
  (prisma as unknown as { $transaction: jest.Mock }).$transaction = jest.fn((arg: unknown[]) =>
    Promise.all(arg as never[])
  );
  return prisma;
}

describe('MenusRepository', () => {
  it('getDefaultSite throws when no site exists', async () => {
    const prisma = buildPrismaMock();
    (prisma.site.findFirst as jest.Mock).mockResolvedValue(null);
    const repository = new MenusRepository(prisma);
    await expect(repository.getDefaultSite()).rejects.toThrow();
  });

  it('getDefaultSite returns the first active site', async () => {
    const prisma = buildPrismaMock();
    (prisma.site.findFirst as jest.Mock).mockResolvedValue({ id: 'site-1' });
    const repository = new MenusRepository(prisma);
    expect(await repository.getDefaultSite()).toEqual({ id: 'site-1' });
  });

  it('findBySlug scopes by siteId and excludes soft-deleted rows', async () => {
    const prisma = buildPrismaMock();
    const repository = new MenusRepository(prisma);
    await repository.findBySlug('header', 'site-1');
    expect(prisma.menu.findFirst).toHaveBeenCalledWith({
      where: { slug: 'header', siteId: 'site-1', deletedAt: null },
    });
  });

  it('findBySlug excludes a given id when checking uniqueness on update', async () => {
    const prisma = buildPrismaMock();
    const repository = new MenusRepository(prisma);
    await repository.findBySlug('header', 'site-1', 'menu-1');
    expect(prisma.menu.findFirst).toHaveBeenCalledWith({
      where: { slug: 'header', siteId: 'site-1', deletedAt: null, id: { not: 'menu-1' } },
    });
  });

  describe('findByLocation (Backend Milestone 11.4)', () => {
    it('scopes by siteId and excludes soft-deleted rows', async () => {
      const prisma = buildPrismaMock();
      const repository = new MenusRepository(prisma);
      await repository.findByLocation('header', 'site-1');
      expect(prisma.menu.findFirst).toHaveBeenCalledWith({
        where: { location: 'header', siteId: 'site-1', deletedAt: null },
      });
    });

    it('excludes a given id when checking uniqueness on update', async () => {
      const prisma = buildPrismaMock();
      const repository = new MenusRepository(prisma);
      await repository.findByLocation('header', 'site-1', 'menu-1');
      expect(prisma.menu.findFirst).toHaveBeenCalledWith({
        where: { location: 'header', siteId: 'site-1', deletedAt: null, id: { not: 'menu-1' } },
      });
    });
  });

  describe('batched target slug lookups (Backend Milestone 11.4)', () => {
    it('findPagesByIds returns [] without querying for an empty id list', async () => {
      const prisma = buildPrismaMock();
      const repository = new MenusRepository(prisma);
      expect(await repository.findPagesByIds([], 'site-1')).toEqual([]);
      expect(prisma.page.findMany).not.toHaveBeenCalled();
    });

    it('findPagesByIds scopes by siteId, non-deleted, and the given ids', async () => {
      const prisma = buildPrismaMock();
      const repository = new MenusRepository(prisma);
      await repository.findPagesByIds(['p1', 'p2'], 'site-1');
      expect(prisma.page.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['p1', 'p2'] }, siteId: 'site-1', deletedAt: null },
        select: { id: true, slug: true },
      });
    });

    it('findArticlesByIds returns [] without querying for an empty id list', async () => {
      const prisma = buildPrismaMock();
      const repository = new MenusRepository(prisma);
      expect(await repository.findArticlesByIds([], 'site-1')).toEqual([]);
      expect(prisma.article.findMany).not.toHaveBeenCalled();
    });

    it('findCategoriesByIds returns [] without querying for an empty id list', async () => {
      const prisma = buildPrismaMock();
      const repository = new MenusRepository(prisma);
      expect(await repository.findCategoriesByIds([], 'site-1')).toEqual([]);
      expect(prisma.category.findMany).not.toHaveBeenCalled();
    });
  });

  it('findMany applies search and pagination', async () => {
    const prisma = buildPrismaMock();
    const repository = new MenusRepository(prisma);
    await repository.findMany('site-1', {
      filters: { search: 'header' },
      sortBy: MenuSortField.CREATED_AT,
      sortOrder: SortOrder.DESC,
      page: 2,
      limit: 10,
    });
    expect(prisma.menu.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ name: { contains: 'header', mode: 'insensitive' } }),
        skip: 10,
        take: 10,
      })
    );
  });

  it('findMany filters by location', async () => {
    const prisma = buildPrismaMock();
    const repository = new MenusRepository(prisma);
    await repository.findMany('site-1', {
      filters: { location: 'footer' },
      sortBy: MenuSortField.NAME,
      sortOrder: SortOrder.ASC,
      page: 1,
      limit: 20,
    });
    expect(prisma.menu.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ location: 'footer' }) })
    );
  });

  it('countActiveChildren counts non-deleted children of an item', async () => {
    const prisma = buildPrismaMock();
    const repository = new MenusRepository(prisma);
    await repository.countActiveChildren('item-1');
    expect(prisma.menuItem.count).toHaveBeenCalledWith({
      where: { parentId: 'item-1', deletedAt: null },
    });
  });

  it('findItemsByMenuId excludes soft-deleted items', async () => {
    const prisma = buildPrismaMock();
    const repository = new MenusRepository(prisma);
    await repository.findItemsByMenuId('menu-1');
    expect(prisma.menuItem.findMany).toHaveBeenCalledWith({
      where: { menuId: 'menu-1', deletedAt: null },
    });
  });

  it('reorderItems applies every update inside one transaction', async () => {
    const prisma = buildPrismaMock();
    const repository = new MenusRepository(prisma);
    await repository.reorderItems([
      { id: 'item-1', parentId: null, sortOrder: 0 },
      { id: 'item-2', parentId: 'item-1', sortOrder: 0 },
    ]);
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Array));
    expect(prisma.menuItem.update).toHaveBeenCalledTimes(2);
  });

  it('findPageById scopes by non-deleted and returns siteId for ownership checks', async () => {
    const prisma = buildPrismaMock();
    (prisma.page.findFirst as jest.Mock).mockResolvedValue({ id: 'page-1', siteId: 'site-1' });
    const repository = new MenusRepository(prisma);
    const result = await repository.findPageById('page-1');
    expect(result).toEqual({ id: 'page-1', siteId: 'site-1' });
    expect(prisma.page.findFirst).toHaveBeenCalledWith({
      where: { id: 'page-1', deletedAt: null },
      select: { id: true, siteId: true },
    });
  });

  it('findArticleById scopes by non-deleted and returns siteId', async () => {
    const prisma = buildPrismaMock();
    (prisma.article.findFirst as jest.Mock).mockResolvedValue(null);
    const repository = new MenusRepository(prisma);
    expect(await repository.findArticleById('missing')).toBeNull();
  });

  it('findCategoryById scopes by non-deleted and returns siteId', async () => {
    const prisma = buildPrismaMock();
    (prisma.category.findFirst as jest.Mock).mockResolvedValue({ id: 'c1', siteId: 'site-1' });
    const repository = new MenusRepository(prisma);
    expect(await repository.findCategoryById('c1')).toEqual({ id: 'c1', siteId: 'site-1' });
  });

  describe('public read path (Backend Milestone 11.3)', () => {
    it('findPublishedBySlug scopes by siteId, non-deleted, and PUBLISHED status', async () => {
      const prisma = buildPrismaMock();
      const repository = new MenusRepository(prisma);
      await repository.findPublishedBySlug('header', 'site-1');
      expect(prisma.menu.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: 'header', siteId: 'site-1', deletedAt: null, status: 'PUBLISHED' },
        })
      );
    });

    it('findPublishedByLocation scopes by siteId, non-deleted, and PUBLISHED status', async () => {
      const prisma = buildPrismaMock();
      const repository = new MenusRepository(prisma);
      await repository.findPublishedByLocation('header', 'site-1');
      expect(prisma.menu.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { location: 'header', siteId: 'site-1', deletedAt: null, status: 'PUBLISHED' },
        })
      );
    });

    it('findPublishedBySlug returns null when no PUBLISHED menu matches', async () => {
      const prisma = buildPrismaMock();
      (prisma.menu.findFirst as jest.Mock).mockResolvedValue(null);
      const repository = new MenusRepository(prisma);
      expect(await repository.findPublishedBySlug('missing', 'site-1')).toBeNull();
    });
  });
});
