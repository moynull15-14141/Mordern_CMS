import { LayoutSortField } from '../constants/layout.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { LayoutsRepository } from './layouts.repository';

function buildPrismaMock() {
  return {
    site: { findFirst: jest.fn() },
    layout: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;
}

describe('LayoutsRepository', () => {
  it('getDefaultSite throws when no site exists', async () => {
    const prisma = buildPrismaMock();
    (prisma.site.findFirst as jest.Mock).mockResolvedValue(null);
    const repository = new LayoutsRepository(prisma);
    await expect(repository.getDefaultSite()).rejects.toThrow();
  });

  describe('findById', () => {
    it('excludes soft-deleted rows by default', async () => {
      const prisma = buildPrismaMock();
      const repository = new LayoutsRepository(prisma);
      await repository.findById('layout-1');
      expect(prisma.layout.findFirst).toHaveBeenCalledWith({
        where: { id: 'layout-1', deletedAt: null },
      });
    });

    it('includes soft-deleted rows when includeDeleted is true', async () => {
      const prisma = buildPrismaMock();
      const repository = new LayoutsRepository(prisma);
      await repository.findById('layout-1', true);
      expect(prisma.layout.findFirst).toHaveBeenCalledWith({ where: { id: 'layout-1' } });
    });
  });

  describe('findBySlug', () => {
    it('scopes by siteId and excludes soft-deleted rows', async () => {
      const prisma = buildPrismaMock();
      const repository = new LayoutsRepository(prisma);
      await repository.findBySlug('default', 'site-1');
      expect(prisma.layout.findFirst).toHaveBeenCalledWith({
        where: { slug: 'default', siteId: 'site-1', deletedAt: null },
      });
    });

    it('excludes a given id when checking uniqueness on update', async () => {
      const prisma = buildPrismaMock();
      const repository = new LayoutsRepository(prisma);
      await repository.findBySlug('default', 'site-1', 'layout-1');
      expect(prisma.layout.findFirst).toHaveBeenCalledWith({
        where: { slug: 'default', siteId: 'site-1', deletedAt: null, id: { not: 'layout-1' } },
      });
    });
  });

  describe('findMany', () => {
    it('applies search, status, themeId filters and pagination', async () => {
      const prisma = buildPrismaMock();
      const repository = new LayoutsRepository(prisma);
      await repository.findMany('site-1', {
        filters: { search: 'blog', status: 'PUBLISHED' as never, themeId: 'theme-1' },
        sortBy: LayoutSortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
        page: 2,
        limit: 10,
      });
      expect(prisma.layout.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: { contains: 'blog', mode: 'insensitive' },
            status: 'PUBLISHED',
            themeId: 'theme-1',
          }),
          skip: 10,
          take: 10,
        })
      );
    });

    it('does not filter by themeId when omitted', async () => {
      const prisma = buildPrismaMock();
      const repository = new LayoutsRepository(prisma);
      await repository.findMany('site-1', {
        filters: {},
        sortBy: LayoutSortField.NAME,
        sortOrder: SortOrder.ASC,
        page: 1,
        limit: 20,
      });
      const call = (prisma.layout.findMany as jest.Mock).mock.calls[0][0];
      expect(call.where).not.toHaveProperty('themeId');
    });
  });

  describe('softDelete / restore', () => {
    it('softDelete stamps deletedAt and deletedBy', async () => {
      const prisma = buildPrismaMock();
      const repository = new LayoutsRepository(prisma);
      await repository.softDelete('layout-1', 'actor-1');
      expect(prisma.layout.update).toHaveBeenCalledWith({
        where: { id: 'layout-1' },
        data: { deletedAt: expect.any(Date), deletedBy: 'actor-1' },
      });
    });

    it('restore clears deletedAt/deletedBy and stamps updatedBy', async () => {
      const prisma = buildPrismaMock();
      const repository = new LayoutsRepository(prisma);
      await repository.restore('layout-1', 'actor-1');
      expect(prisma.layout.update).toHaveBeenCalledWith({
        where: { id: 'layout-1' },
        data: { deletedAt: null, deletedBy: null, updatedBy: 'actor-1' },
      });
    });
  });

  it('create passes data straight through to prisma.layout.create', async () => {
    const prisma = buildPrismaMock();
    const repository = new LayoutsRepository(prisma);
    const data = { name: 'Default' } as never;
    await repository.create(data);
    expect(prisma.layout.create).toHaveBeenCalledWith({ data });
  });

  it('update passes id and data straight through to prisma.layout.update', async () => {
    const prisma = buildPrismaMock();
    const repository = new LayoutsRepository(prisma);
    const data = { name: 'New Name' } as never;
    await repository.update('layout-1', data);
    expect(prisma.layout.update).toHaveBeenCalledWith({ where: { id: 'layout-1' }, data });
  });
});
