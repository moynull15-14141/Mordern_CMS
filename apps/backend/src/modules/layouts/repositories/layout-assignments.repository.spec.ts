import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { LayoutAssignmentsRepository } from './layout-assignments.repository';

function buildPrismaMock() {
  return {
    site: { findFirst: jest.fn() },
    layout: { findFirst: jest.fn() },
    page: { findFirst: jest.fn() },
    article: { findFirst: jest.fn() },
    category: { findFirst: jest.fn() },
    layoutAssignment: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;
}

describe('LayoutAssignmentsRepository', () => {
  describe('findByTarget', () => {
    it('queries an exact match on every target field, including literal nulls', async () => {
      const prisma = buildPrismaMock();
      const repository = new LayoutAssignmentsRepository(prisma);
      await repository.findByTarget('site-1', {
        contentType: 'PAGE' as never,
        pageId: null,
        articleId: null,
        categoryId: null,
      });
      expect(prisma.layoutAssignment.findFirst).toHaveBeenCalledWith({
        where: {
          siteId: 'site-1',
          contentType: 'PAGE',
          pageId: null,
          articleId: null,
          categoryId: null,
          deletedAt: null,
        },
      });
    });
  });

  describe('findPublishedByTarget', () => {
    it('additionally gates on the joined Layout being PUBLISHED and non-deleted', async () => {
      const prisma = buildPrismaMock();
      const repository = new LayoutAssignmentsRepository(prisma);
      await repository.findPublishedByTarget('site-1', {
        contentType: 'HOMEPAGE' as never,
        pageId: null,
        articleId: null,
        categoryId: null,
      });
      expect(prisma.layoutAssignment.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ layout: { status: 'PUBLISHED', deletedAt: null } }),
          include: { layout: true },
        })
      );
    });
  });

  describe('findMany', () => {
    it('filters by contentType only when given', async () => {
      const prisma = buildPrismaMock();
      const repository = new LayoutAssignmentsRepository(prisma);
      await repository.findMany('site-1');
      const call = (prisma.layoutAssignment.findMany as jest.Mock).mock.calls[0][0];
      expect(call.where).not.toHaveProperty('contentType');

      await repository.findMany('site-1', 'PAGE' as never);
      const call2 = (prisma.layoutAssignment.findMany as jest.Mock).mock.calls[1][0];
      expect(call2.where).toMatchObject({ contentType: 'PAGE' });
    });
  });

  describe('cross-entity existence checks', () => {
    it('findLayoutById/findPageById/findArticleById/findCategoryById scope to non-deleted rows', async () => {
      const prisma = buildPrismaMock();
      const repository = new LayoutAssignmentsRepository(prisma);

      await repository.findLayoutById('layout-1');
      expect(prisma.layout.findFirst).toHaveBeenCalledWith({
        where: { id: 'layout-1', deletedAt: null },
        select: { id: true },
      });

      await repository.findPageById('page-1');
      expect(prisma.page.findFirst).toHaveBeenCalledWith({
        where: { id: 'page-1', deletedAt: null },
        select: { id: true },
      });
    });
  });
});
