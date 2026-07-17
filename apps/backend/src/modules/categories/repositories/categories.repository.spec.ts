import { CategorySortField } from '../constants/category.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { CategoriesRepository } from './categories.repository';

function buildPrismaMock() {
  return {
    site: { findFirst: jest.fn() },
    category: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      groupBy: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
    },
    article: { count: jest.fn().mockResolvedValue(0), groupBy: jest.fn().mockResolvedValue([]) },
    seoMeta: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
  } as unknown as PrismaService;
}

describe('CategoriesRepository', () => {
  it('getDefaultSite throws when no site exists', async () => {
    const prisma = buildPrismaMock();
    (prisma.site.findFirst as jest.Mock).mockResolvedValue(null);
    const repository = new CategoriesRepository(prisma);
    await expect(repository.getDefaultSite()).rejects.toThrow();
  });

  it('getDefaultSite returns the first active site', async () => {
    const prisma = buildPrismaMock();
    (prisma.site.findFirst as jest.Mock).mockResolvedValue({ id: 'site-1' });
    const repository = new CategoriesRepository(prisma);
    expect(await repository.getDefaultSite()).toEqual({ id: 'site-1' });
  });

  it('findAllForSite scopes by siteId and excludes soft-deleted rows', async () => {
    const prisma = buildPrismaMock();
    const repository = new CategoriesRepository(prisma);
    await repository.findAllForSite('site-1');
    expect(prisma.category.findMany).toHaveBeenCalledWith({
      where: { siteId: 'site-1', deletedAt: null },
    });
  });

  it('findById excludes soft-deleted by default', async () => {
    const prisma = buildPrismaMock();
    const repository = new CategoriesRepository(prisma);
    await repository.findById('cat-1');
    expect(prisma.category.findFirst).toHaveBeenCalledWith({
      where: { id: 'cat-1', deletedAt: null },
    });
  });

  it('findById includes soft-deleted when requested', async () => {
    const prisma = buildPrismaMock();
    const repository = new CategoriesRepository(prisma);
    await repository.findById('cat-1', true);
    expect(prisma.category.findFirst).toHaveBeenCalledWith({ where: { id: 'cat-1' } });
  });

  it('findBySlug excludes a given id for update-time checks', async () => {
    const prisma = buildPrismaMock();
    const repository = new CategoriesRepository(prisma);
    await repository.findBySlug('news', 'site-1', 'cat-1');
    expect(prisma.category.findFirst).toHaveBeenCalledWith({
      where: { slug: 'news', siteId: 'site-1', deletedAt: null, id: { not: 'cat-1' } },
    });
  });

  it('findByName scopes by siteId', async () => {
    const prisma = buildPrismaMock();
    const repository = new CategoriesRepository(prisma);
    await repository.findByName('News', 'site-1');
    expect(prisma.category.findFirst).toHaveBeenCalledWith({
      where: { name: 'News', siteId: 'site-1', deletedAt: null },
    });
  });

  it('findMany filters by parentId and status', async () => {
    const prisma = buildPrismaMock();
    const repository = new CategoriesRepository(prisma);
    await repository.findMany('site-1', {
      filters: { parentId: 'root-1' },
      sortBy: CategorySortField.NAME,
      sortOrder: SortOrder.ASC,
      page: 1,
      limit: 20,
    });
    expect(prisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ parentId: 'root-1' }) })
    );
  });

  it('findMany applies pagination', async () => {
    const prisma = buildPrismaMock();
    const repository = new CategoriesRepository(prisma);
    await repository.findMany('site-1', {
      filters: {},
      sortBy: CategorySortField.SORT_ORDER,
      sortOrder: SortOrder.ASC,
      page: 2,
      limit: 10,
    });
    expect(prisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    );
  });

  it('countArticlesUsingCategory counts non-deleted articles by primaryCategoryId', async () => {
    const prisma = buildPrismaMock();
    const repository = new CategoriesRepository(prisma);
    await repository.countArticlesUsingCategory('cat-1');
    expect(prisma.article.count).toHaveBeenCalledWith({
      where: { primaryCategoryId: 'cat-1', deletedAt: null },
    });
  });

  it('countActiveChildren counts non-deleted categories by parentId', async () => {
    const prisma = buildPrismaMock();
    const repository = new CategoriesRepository(prisma);
    await repository.countActiveChildren('cat-1');
    expect(prisma.category.count).toHaveBeenCalledWith({
      where: { parentId: 'cat-1', deletedAt: null },
    });
  });

  it('softDelete sets deletedAt/deletedBy', async () => {
    const prisma = buildPrismaMock();
    const repository = new CategoriesRepository(prisma);
    await repository.softDelete('cat-1', 'actor-1');
    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: 'cat-1' },
      data: { deletedAt: expect.any(Date), deletedBy: 'actor-1' },
    });
  });

  it('restore clears deletedAt/deletedBy', async () => {
    const prisma = buildPrismaMock();
    const repository = new CategoriesRepository(prisma);
    await repository.restore('cat-1', 'actor-1');
    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: 'cat-1' },
      data: { deletedAt: null, deletedBy: null, updatedBy: 'actor-1' },
    });
  });

  it('upsertSeoMeta creates with a site connect when no existing id given', async () => {
    const prisma = buildPrismaMock();
    (prisma.seoMeta.create as jest.Mock).mockResolvedValue({ id: 'seo-1' });
    const repository = new CategoriesRepository(prisma);
    const id = await repository.upsertSeoMeta(null, 'site-1', { title: 'T' } as never, 'actor-1');
    expect(id).toBe('seo-1');
    expect(prisma.seoMeta.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ title: 'T', site: { connect: { id: 'site-1' } } }),
    });
  });

  it('upsertSeoMeta updates the existing row when an id is given', async () => {
    const prisma = buildPrismaMock();
    (prisma.seoMeta.update as jest.Mock).mockResolvedValue({ id: 'seo-1' });
    const repository = new CategoriesRepository(prisma);
    const id = await repository.upsertSeoMeta(
      'seo-1',
      'site-1',
      { title: 'T2' } as never,
      'actor-1'
    );
    expect(id).toBe('seo-1');
    expect(prisma.seoMeta.create).not.toHaveBeenCalled();
  });

  it('findSeoMetaById looks up by id', async () => {
    const prisma = buildPrismaMock();
    const repository = new CategoriesRepository(prisma);
    await repository.findSeoMetaById('seo-1');
    expect(prisma.seoMeta.findUnique).toHaveBeenCalledWith({ where: { id: 'seo-1' } });
  });

  describe('batched count/lookup methods (stabilization patch — N+1 fix)', () => {
    it('countArticlesUsingCategories issues one groupBy for all ids and returns a Map', async () => {
      const prisma = buildPrismaMock();
      (prisma.article.groupBy as jest.Mock).mockResolvedValue([
        { primaryCategoryId: 'cat-1', _count: { _all: 3 } },
        { primaryCategoryId: 'cat-2', _count: { _all: 0 } },
      ]);
      const repository = new CategoriesRepository(prisma);
      const result = await repository.countArticlesUsingCategories(['cat-1', 'cat-2']);
      expect(prisma.article.groupBy).toHaveBeenCalledTimes(1);
      expect(prisma.article.groupBy).toHaveBeenCalledWith({
        by: ['primaryCategoryId'],
        where: { primaryCategoryId: { in: ['cat-1', 'cat-2'] }, deletedAt: null },
        _count: { _all: true },
      });
      expect(result.get('cat-1')).toBe(3);
      expect(result.get('cat-2')).toBe(0);
    });

    it('countArticlesUsingCategories returns an empty Map without querying for an empty id list', async () => {
      const prisma = buildPrismaMock();
      const repository = new CategoriesRepository(prisma);
      const result = await repository.countArticlesUsingCategories([]);
      expect(result.size).toBe(0);
      expect(prisma.article.groupBy).not.toHaveBeenCalled();
    });

    it('countActiveChildrenForCategories issues one groupBy for all ids', async () => {
      const prisma = buildPrismaMock();
      (prisma.category.groupBy as jest.Mock).mockResolvedValue([
        { parentId: 'cat-1', _count: { _all: 2 } },
      ]);
      const repository = new CategoriesRepository(prisma);
      const result = await repository.countActiveChildrenForCategories(['cat-1', 'cat-2']);
      expect(prisma.category.groupBy).toHaveBeenCalledTimes(1);
      expect(result.get('cat-1')).toBe(2);
      expect(result.get('cat-2')).toBeUndefined();
    });

    it('findSeoMetaByIds issues one findMany for all ids and returns a Map keyed by id', async () => {
      const prisma = buildPrismaMock();
      (prisma.seoMeta.findMany as jest.Mock).mockResolvedValue([{ id: 'seo-1', title: 'A' }]);
      const repository = new CategoriesRepository(prisma);
      const result = await repository.findSeoMetaByIds(['seo-1', 'seo-2']);
      expect(prisma.seoMeta.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.seoMeta.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['seo-1', 'seo-2'] } },
      });
      expect(result.get('seo-1')).toEqual({ id: 'seo-1', title: 'A' });
    });

    it('findSeoMetaByIds returns an empty Map without querying for an empty id list', async () => {
      const prisma = buildPrismaMock();
      const repository = new CategoriesRepository(prisma);
      const result = await repository.findSeoMetaByIds([]);
      expect(result.size).toBe(0);
      expect(prisma.seoMeta.findMany).not.toHaveBeenCalled();
    });
  });
});
