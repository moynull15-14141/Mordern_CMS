import { PatternSortField } from '../constants/patterns.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PatternRepository } from './pattern.repository';

function buildPrismaMock() {
  return {
    site: { findFirst: jest.fn() },
    mediaAsset: { count: jest.fn().mockResolvedValue(0) },
    pattern: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      update: jest.fn(),
    },
    page: { findMany: jest.fn().mockResolvedValue([]) },
    article: { findMany: jest.fn().mockResolvedValue([]) },
    reusableBlock: { findMany: jest.fn().mockResolvedValue([]) },
  } as unknown as PrismaService;
}

describe('PatternRepository', () => {
  it('getDefaultSite throws when no site exists', async () => {
    const prisma = buildPrismaMock();
    (prisma.site.findFirst as jest.Mock).mockResolvedValue(null);
    const repository = new PatternRepository(prisma);
    await expect(repository.getDefaultSite()).rejects.toThrow();
  });

  describe('findById', () => {
    it('excludes soft-deleted rows by default', async () => {
      const prisma = buildPrismaMock();
      const repository = new PatternRepository(prisma);
      await repository.findById('pattern-1');
      expect(prisma.pattern.findFirst).toHaveBeenCalledWith({
        where: { id: 'pattern-1', deletedAt: null },
      });
    });

    it('includes soft-deleted rows when includeDeleted is true', async () => {
      const prisma = buildPrismaMock();
      const repository = new PatternRepository(prisma);
      await repository.findById('pattern-1', true);
      expect(prisma.pattern.findFirst).toHaveBeenCalledWith({ where: { id: 'pattern-1' } });
    });
  });

  describe('findBySlug', () => {
    it('scopes by siteId and excludes soft-deleted rows', async () => {
      const prisma = buildPrismaMock();
      const repository = new PatternRepository(prisma);
      await repository.findBySlug('hero-banner', 'site-1');
      expect(prisma.pattern.findFirst).toHaveBeenCalledWith({
        where: { slug: 'hero-banner', siteId: 'site-1', deletedAt: null },
      });
    });

    it('excludes a given id when checking uniqueness on update', async () => {
      const prisma = buildPrismaMock();
      const repository = new PatternRepository(prisma);
      await repository.findBySlug('hero-banner', 'site-1', 'pattern-1');
      expect(prisma.pattern.findFirst).toHaveBeenCalledWith({
        where: { slug: 'hero-banner', siteId: 'site-1', deletedAt: null, id: { not: 'pattern-1' } },
      });
    });
  });

  describe('mediaAssetExists', () => {
    it('returns true when the count is greater than zero', async () => {
      const prisma = buildPrismaMock();
      (prisma.mediaAsset.count as jest.Mock).mockResolvedValue(1);
      const repository = new PatternRepository(prisma);
      await expect(repository.mediaAssetExists('media-1', 'site-1')).resolves.toBe(true);
    });

    it('returns false when nothing matches', async () => {
      const prisma = buildPrismaMock();
      const repository = new PatternRepository(prisma);
      await expect(repository.mediaAssetExists('missing', 'site-1')).resolves.toBe(false);
    });
  });

  describe('findMany', () => {
    it('filters by category/status/tags/search and applies sort+pagination', async () => {
      const prisma = buildPrismaMock();
      const repository = new PatternRepository(prisma);
      await repository.findMany('site-1', {
        filters: {
          category: 'Hero',
          status: 'ACTIVE' as never,
          tags: ['landing', 'marketing'],
          search: 'banner',
        },
        sortBy: PatternSortField.NAME,
        sortOrder: SortOrder.ASC,
        page: 2,
        limit: 10,
      });
      expect(prisma.pattern.findMany).toHaveBeenCalledWith({
        where: {
          siteId: 'site-1',
          deletedAt: null,
          category: 'Hero',
          status: 'ACTIVE',
          tags: { hasSome: ['landing', 'marketing'] },
          OR: [
            { name: { contains: 'banner', mode: 'insensitive' } },
            { description: { contains: 'banner', mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
        skip: 10,
        take: 10,
      });
    });
  });

  describe('updateStatus', () => {
    it('sets status and updatedBy', async () => {
      const prisma = buildPrismaMock();
      const repository = new PatternRepository(prisma);
      await repository.updateStatus('pattern-1', 'ARCHIVED' as never, 'user-1');
      expect(prisma.pattern.update).toHaveBeenCalledWith({
        where: { id: 'pattern-1' },
        data: { status: 'ARCHIVED', updatedBy: 'user-1' },
      });
    });
  });

  describe('softDelete / restore', () => {
    it('softDelete sets deletedAt/deletedBy', async () => {
      const prisma = buildPrismaMock();
      const repository = new PatternRepository(prisma);
      await repository.softDelete('pattern-1', 'user-1');
      expect(prisma.pattern.update).toHaveBeenCalledWith({
        where: { id: 'pattern-1' },
        data: { deletedAt: expect.any(Date), deletedBy: 'user-1' },
      });
    });

    it('restore clears deletedAt/deletedBy', async () => {
      const prisma = buildPrismaMock();
      const repository = new PatternRepository(prisma);
      await repository.restore('pattern-1', 'user-1');
      expect(prisma.pattern.update).toHaveBeenCalledWith({
        where: { id: 'pattern-1' },
        data: { deletedAt: null, deletedBy: null, updatedBy: 'user-1' },
      });
    });
  });

  describe('origin-scan body finders', () => {
    it('findActivePageBodies scopes by siteId and active rows', async () => {
      const prisma = buildPrismaMock();
      const repository = new PatternRepository(prisma);
      await repository.findActivePageBodies('site-1');
      expect(prisma.page.findMany).toHaveBeenCalledWith({
        where: { siteId: 'site-1', deletedAt: null },
        select: { id: true, title: true, slug: true, body: true },
      });
    });

    it('findActiveArticleBodies scopes by siteId and active rows', async () => {
      const prisma = buildPrismaMock();
      const repository = new PatternRepository(prisma);
      await repository.findActiveArticleBodies('site-1');
      expect(prisma.article.findMany).toHaveBeenCalledWith({
        where: { siteId: 'site-1', deletedAt: null },
        select: { id: true, title: true, slug: true, body: true },
      });
    });

    it('findActiveReusableBlockBodies scopes by siteId and active rows', async () => {
      const prisma = buildPrismaMock();
      const repository = new PatternRepository(prisma);
      await repository.findActiveReusableBlockBodies('site-1');
      expect(prisma.reusableBlock.findMany).toHaveBeenCalledWith({
        where: { siteId: 'site-1', deletedAt: null },
        select: { id: true, name: true, blockType: true, data: true, children: true },
      });
    });
  });
});
