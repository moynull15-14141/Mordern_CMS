import { PageSortField } from '../constants/page.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PagesRepository } from './pages.repository';

function buildPrismaMock() {
  return {
    site: { findFirst: jest.fn() },
    page: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      update: jest.fn(),
    },
    seoMeta: { create: jest.fn(), update: jest.fn() },
  } as unknown as PrismaService;
}

describe('PagesRepository', () => {
  it('getDefaultSite throws when no site exists', async () => {
    const prisma = buildPrismaMock();
    (prisma.site.findFirst as jest.Mock).mockResolvedValue(null);
    const repository = new PagesRepository(prisma);
    await expect(repository.getDefaultSite()).rejects.toThrow();
  });

  it('getDefaultSite returns the first active site', async () => {
    const prisma = buildPrismaMock();
    (prisma.site.findFirst as jest.Mock).mockResolvedValue({ id: 'site-1' });
    const repository = new PagesRepository(prisma);
    expect(await repository.getDefaultSite()).toEqual({ id: 'site-1' });
    expect(prisma.site.findFirst).toHaveBeenCalledWith({ where: { deletedAt: null } });
  });

  it('findBySlug scopes by siteId and excludes soft-deleted rows', async () => {
    const prisma = buildPrismaMock();
    const repository = new PagesRepository(prisma);
    await repository.findBySlug('about-us', 'site-1');
    expect(prisma.page.findFirst).toHaveBeenCalledWith({
      where: { slug: 'about-us', siteId: 'site-1', deletedAt: null },
    });
  });

  it('findBySlug excludes a given id when checking uniqueness on update', async () => {
    const prisma = buildPrismaMock();
    const repository = new PagesRepository(prisma);
    await repository.findBySlug('about-us', 'site-1', 'page-1');
    expect(prisma.page.findFirst).toHaveBeenCalledWith({
      where: { slug: 'about-us', siteId: 'site-1', deletedAt: null, id: { not: 'page-1' } },
    });
  });

  it('findMany applies search and pagination', async () => {
    const prisma = buildPrismaMock();
    const repository = new PagesRepository(prisma);
    await repository.findMany('site-1', {
      filters: { search: 'about' },
      sortBy: PageSortField.CREATED_AT,
      sortOrder: SortOrder.DESC,
      page: 2,
      limit: 10,
    });
    expect(prisma.page.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          title: { contains: 'about', mode: 'insensitive' },
        }),
        skip: 10,
        take: 10,
      })
    );
  });

  it('upsertSeoMeta creates a new row (with site connect) when no existing id is given', async () => {
    const prisma = buildPrismaMock();
    (prisma.seoMeta.create as jest.Mock).mockResolvedValue({ id: 'seo-1' });
    const repository = new PagesRepository(prisma);
    const id = await repository.upsertSeoMeta(null, 'site-1', { title: 'T' } as never, 'actor-1');
    expect(id).toBe('seo-1');
    expect(prisma.seoMeta.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ title: 'T', site: { connect: { id: 'site-1' } } }),
    });
  });

  it('upsertSeoMeta updates the existing row when an id is given', async () => {
    const prisma = buildPrismaMock();
    (prisma.seoMeta.update as jest.Mock).mockResolvedValue({ id: 'seo-1' });
    const repository = new PagesRepository(prisma);
    const id = await repository.upsertSeoMeta(
      'seo-1',
      'site-1',
      { title: 'T2' } as never,
      'actor-1'
    );
    expect(id).toBe('seo-1');
    expect(prisma.seoMeta.create).not.toHaveBeenCalled();
  });
});
