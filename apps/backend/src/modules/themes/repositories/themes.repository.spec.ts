import { ThemeSortField } from '../constants/theme.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { ThemesRepository } from './themes.repository';

function buildPrismaMock() {
  const prisma = {
    site: { findFirst: jest.fn() },
    theme: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  } as unknown as PrismaService;
  (prisma as unknown as { $transaction: jest.Mock }).$transaction = jest.fn((arg: unknown[]) =>
    Promise.all(arg as never[])
  );
  return prisma;
}

describe('ThemesRepository', () => {
  it('getDefaultSite throws when no site exists', async () => {
    const prisma = buildPrismaMock();
    (prisma.site.findFirst as jest.Mock).mockResolvedValue(null);
    const repository = new ThemesRepository(prisma);
    await expect(repository.getDefaultSite()).rejects.toThrow();
  });

  it('getDefaultSite returns the first active site', async () => {
    const prisma = buildPrismaMock();
    (prisma.site.findFirst as jest.Mock).mockResolvedValue({ id: 'site-1' });
    const repository = new ThemesRepository(prisma);
    expect(await repository.getDefaultSite()).toEqual({ id: 'site-1' });
  });

  describe('findById', () => {
    it('excludes soft-deleted rows by default', async () => {
      const prisma = buildPrismaMock();
      const repository = new ThemesRepository(prisma);
      await repository.findById('theme-1');
      expect(prisma.theme.findFirst).toHaveBeenCalledWith({
        where: { id: 'theme-1', deletedAt: null },
      });
    });

    it('includes soft-deleted rows when includeDeleted is true', async () => {
      const prisma = buildPrismaMock();
      const repository = new ThemesRepository(prisma);
      await repository.findById('theme-1', true);
      expect(prisma.theme.findFirst).toHaveBeenCalledWith({ where: { id: 'theme-1' } });
    });
  });

  describe('findBySlug', () => {
    it('scopes by siteId and excludes soft-deleted rows', async () => {
      const prisma = buildPrismaMock();
      const repository = new ThemesRepository(prisma);
      await repository.findBySlug('classic', 'site-1');
      expect(prisma.theme.findFirst).toHaveBeenCalledWith({
        where: { slug: 'classic', siteId: 'site-1', deletedAt: null },
      });
    });

    it('excludes a given id when checking uniqueness on update', async () => {
      const prisma = buildPrismaMock();
      const repository = new ThemesRepository(prisma);
      await repository.findBySlug('classic', 'site-1', 'theme-1');
      expect(prisma.theme.findFirst).toHaveBeenCalledWith({
        where: { slug: 'classic', siteId: 'site-1', deletedAt: null, id: { not: 'theme-1' } },
      });
    });
  });

  describe('findActive', () => {
    it('scopes by siteId, isActive, and non-deleted', async () => {
      const prisma = buildPrismaMock();
      const repository = new ThemesRepository(prisma);
      await repository.findActive('site-1');
      expect(prisma.theme.findFirst).toHaveBeenCalledWith({
        where: { siteId: 'site-1', isActive: true, deletedAt: null },
      });
    });

    it('returns null when no theme is active', async () => {
      const prisma = buildPrismaMock();
      (prisma.theme.findFirst as jest.Mock).mockResolvedValue(null);
      const repository = new ThemesRepository(prisma);
      expect(await repository.findActive('site-1')).toBeNull();
    });
  });

  describe('findMany', () => {
    it('applies search and pagination', async () => {
      const prisma = buildPrismaMock();
      const repository = new ThemesRepository(prisma);
      await repository.findMany('site-1', {
        filters: { search: 'classic' },
        sortBy: ThemeSortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
        page: 2,
        limit: 10,
      });
      expect(prisma.theme.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ name: { contains: 'classic', mode: 'insensitive' } }),
          skip: 10,
          take: 10,
        })
      );
    });

    it('filters by status', async () => {
      const prisma = buildPrismaMock();
      const repository = new ThemesRepository(prisma);
      await repository.findMany('site-1', {
        filters: { status: 'PUBLISHED' as never },
        sortBy: ThemeSortField.NAME,
        sortOrder: SortOrder.ASC,
        page: 1,
        limit: 20,
      });
      expect(prisma.theme.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'PUBLISHED' }) })
      );
    });

    it('filters by isActive', async () => {
      const prisma = buildPrismaMock();
      const repository = new ThemesRepository(prisma);
      await repository.findMany('site-1', {
        filters: { isActive: true },
        sortBy: ThemeSortField.NAME,
        sortOrder: SortOrder.ASC,
        page: 1,
        limit: 20,
      });
      expect(prisma.theme.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ isActive: true }) })
      );
    });

    it('does not filter by isActive when omitted (distinct from false)', async () => {
      const prisma = buildPrismaMock();
      const repository = new ThemesRepository(prisma);
      await repository.findMany('site-1', {
        filters: {},
        sortBy: ThemeSortField.NAME,
        sortOrder: SortOrder.ASC,
        page: 1,
        limit: 20,
      });
      const call = (prisma.theme.findMany as jest.Mock).mock.calls[0][0];
      expect(call.where).not.toHaveProperty('isActive');
    });
  });

  describe('activate', () => {
    it('deactivates every other active theme and activates the target in one transaction', async () => {
      const prisma = buildPrismaMock();
      (prisma.theme.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prisma.theme.update as jest.Mock).mockResolvedValue({ id: 'theme-1', isActive: true });
      const repository = new ThemesRepository(prisma);

      const result = await repository.activate('theme-1', 'site-1', 'actor-1');

      expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Array));
      expect(prisma.theme.updateMany).toHaveBeenCalledWith({
        where: { siteId: 'site-1', isActive: true, id: { not: 'theme-1' } },
        data: { isActive: false, updatedBy: 'actor-1' },
      });
      expect(prisma.theme.update).toHaveBeenCalledWith({
        where: { id: 'theme-1' },
        data: { isActive: true, updatedBy: 'actor-1' },
      });
      expect(result).toEqual({ id: 'theme-1', isActive: true });
    });
  });

  describe('softDelete / restore', () => {
    it('softDelete stamps deletedAt and deletedBy', async () => {
      const prisma = buildPrismaMock();
      const repository = new ThemesRepository(prisma);
      await repository.softDelete('theme-1', 'actor-1');
      expect(prisma.theme.update).toHaveBeenCalledWith({
        where: { id: 'theme-1' },
        data: { deletedAt: expect.any(Date), deletedBy: 'actor-1' },
      });
    });

    it('restore clears deletedAt/deletedBy and stamps updatedBy', async () => {
      const prisma = buildPrismaMock();
      const repository = new ThemesRepository(prisma);
      await repository.restore('theme-1', 'actor-1');
      expect(prisma.theme.update).toHaveBeenCalledWith({
        where: { id: 'theme-1' },
        data: { deletedAt: null, deletedBy: null, updatedBy: 'actor-1' },
      });
    });
  });

  it('create passes data straight through to prisma.theme.create', async () => {
    const prisma = buildPrismaMock();
    const repository = new ThemesRepository(prisma);
    const data = { name: 'Classic' } as never;
    await repository.create(data);
    expect(prisma.theme.create).toHaveBeenCalledWith({ data });
  });

  it('update passes id and data straight through to prisma.theme.update', async () => {
    const prisma = buildPrismaMock();
    const repository = new ThemesRepository(prisma);
    const data = { name: 'New Name' } as never;
    await repository.update('theme-1', data);
    expect(prisma.theme.update).toHaveBeenCalledWith({ where: { id: 'theme-1' }, data });
  });
});
