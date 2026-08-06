import { ReusableBlockSortField } from '../constants/reusable-block.constants';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { ReusableBlockRepository } from './reusable-block.repository';

function buildPrismaMock() {
  return {
    site: { findFirst: jest.fn() },
    reusableBlock: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;
}

describe('ReusableBlockRepository', () => {
  it('getDefaultSite throws when no site exists', async () => {
    const prisma = buildPrismaMock();
    (prisma.site.findFirst as jest.Mock).mockResolvedValue(null);
    const repository = new ReusableBlockRepository(prisma);
    await expect(repository.getDefaultSite()).rejects.toThrow();
  });

  describe('findById', () => {
    it('excludes soft-deleted rows by default', async () => {
      const prisma = buildPrismaMock();
      const repository = new ReusableBlockRepository(prisma);
      await repository.findById('block-1');
      expect(prisma.reusableBlock.findFirst).toHaveBeenCalledWith({
        where: { id: 'block-1', deletedAt: null },
      });
    });

    it('includes soft-deleted rows when includeDeleted is true', async () => {
      const prisma = buildPrismaMock();
      const repository = new ReusableBlockRepository(prisma);
      await repository.findById('block-1', true);
      expect(prisma.reusableBlock.findFirst).toHaveBeenCalledWith({ where: { id: 'block-1' } });
    });
  });

  describe('findByName', () => {
    it('scopes by siteId and excludes soft-deleted rows', async () => {
      const prisma = buildPrismaMock();
      const repository = new ReusableBlockRepository(prisma);
      await repository.findByName('CTA', 'site-1');
      expect(prisma.reusableBlock.findFirst).toHaveBeenCalledWith({
        where: { name: 'CTA', siteId: 'site-1', deletedAt: null },
      });
    });

    it('excludes a given id when checking uniqueness on update', async () => {
      const prisma = buildPrismaMock();
      const repository = new ReusableBlockRepository(prisma);
      await repository.findByName('CTA', 'site-1', 'block-1');
      expect(prisma.reusableBlock.findFirst).toHaveBeenCalledWith({
        where: { name: 'CTA', siteId: 'site-1', deletedAt: null, id: { not: 'block-1' } },
      });
    });
  });

  describe('findMany', () => {
    it('applies search and blockType filters and pagination', async () => {
      const prisma = buildPrismaMock();
      const repository = new ReusableBlockRepository(prisma);
      await repository.findMany('site-1', {
        filters: { search: 'cta', blockType: 'callout' },
        sortBy: ReusableBlockSortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
        page: 2,
        limit: 10,
      });
      expect(prisma.reusableBlock.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            name: { contains: 'cta', mode: 'insensitive' },
            blockType: 'callout',
          }),
          skip: 10,
          take: 10,
        })
      );
    });

    it('does not filter by blockType when omitted', async () => {
      const prisma = buildPrismaMock();
      const repository = new ReusableBlockRepository(prisma);
      await repository.findMany('site-1', {
        filters: {},
        sortBy: ReusableBlockSortField.NAME,
        sortOrder: SortOrder.ASC,
        page: 1,
        limit: 20,
      });
      const call = (prisma.reusableBlock.findMany as jest.Mock).mock.calls[0][0];
      expect(call.where).not.toHaveProperty('blockType');
    });
  });

  describe('softDelete / restore', () => {
    it('softDelete stamps deletedAt and deletedBy', async () => {
      const prisma = buildPrismaMock();
      const repository = new ReusableBlockRepository(prisma);
      await repository.softDelete('block-1', 'actor-1');
      expect(prisma.reusableBlock.update).toHaveBeenCalledWith({
        where: { id: 'block-1' },
        data: { deletedAt: expect.any(Date), deletedBy: 'actor-1' },
      });
    });

    it('restore clears deletedAt/deletedBy and stamps updatedBy', async () => {
      const prisma = buildPrismaMock();
      const repository = new ReusableBlockRepository(prisma);
      await repository.restore('block-1', 'actor-1');
      expect(prisma.reusableBlock.update).toHaveBeenCalledWith({
        where: { id: 'block-1' },
        data: { deletedAt: null, deletedBy: null, updatedBy: 'actor-1' },
      });
    });
  });

  it('create passes data straight through to prisma.reusableBlock.create', async () => {
    const prisma = buildPrismaMock();
    const repository = new ReusableBlockRepository(prisma);
    const data = { name: 'CTA' } as never;
    await repository.create(data);
    expect(prisma.reusableBlock.create).toHaveBeenCalledWith({ data });
  });

  it('update passes id and data straight through to prisma.reusableBlock.update', async () => {
    const prisma = buildPrismaMock();
    const repository = new ReusableBlockRepository(prisma);
    const data = { name: 'New Name' } as never;
    await repository.update('block-1', data);
    expect(prisma.reusableBlock.update).toHaveBeenCalledWith({ where: { id: 'block-1' }, data });
  });
});
