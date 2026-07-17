import { CommentStatus } from '@prisma/client';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { CommentSortField } from '../constants/comment.constants';
import { CommentsRepository } from './comments.repository';

function buildPrismaMock() {
  return {
    article: { findFirst: jest.fn() },
    user: { findFirst: jest.fn() },
    comment: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      groupBy: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;
}

describe('CommentsRepository', () => {
  describe('articleExists', () => {
    it('returns true when an active article is found', async () => {
      const prisma = buildPrismaMock();
      (prisma.article.findFirst as jest.Mock).mockResolvedValue({ id: 'article-1' });
      const repository = new CommentsRepository(prisma);
      expect(await repository.articleExists('article-1')).toBe(true);
      expect(prisma.article.findFirst).toHaveBeenCalledWith({
        where: { id: 'article-1', deletedAt: null },
        select: { id: true },
      });
    });

    it('returns false when no article is found', async () => {
      const prisma = buildPrismaMock();
      (prisma.article.findFirst as jest.Mock).mockResolvedValue(null);
      const repository = new CommentsRepository(prisma);
      expect(await repository.articleExists('missing')).toBe(false);
    });
  });

  describe('userExists', () => {
    it('returns true when an active user is found', async () => {
      const prisma = buildPrismaMock();
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 'user-1' });
      const repository = new CommentsRepository(prisma);
      expect(await repository.userExists('user-1')).toBe(true);
    });

    it('returns false when no user is found', async () => {
      const prisma = buildPrismaMock();
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      const repository = new CommentsRepository(prisma);
      expect(await repository.userExists('missing')).toBe(false);
    });
  });

  describe('findById', () => {
    it('excludes soft-deleted by default', async () => {
      const prisma = buildPrismaMock();
      const repository = new CommentsRepository(prisma);
      await repository.findById('c1');
      expect(prisma.comment.findFirst).toHaveBeenCalledWith({
        where: { id: 'c1', deletedAt: null },
      });
    });

    it('includes soft-deleted when requested', async () => {
      const prisma = buildPrismaMock();
      const repository = new CommentsRepository(prisma);
      await repository.findById('c1', true);
      expect(prisma.comment.findFirst).toHaveBeenCalledWith({ where: { id: 'c1' } });
    });
  });

  describe('findMany', () => {
    it('builds a where clause from every filter', async () => {
      const prisma = buildPrismaMock();
      const repository = new CommentsRepository(prisma);
      await repository.findMany({
        filters: {
          articleId: 'a1',
          userId: 'u1',
          parentId: 'p1',
          status: CommentStatus.APPROVED,
          search: 'hi',
        },
        sortBy: CommentSortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
        page: 1,
        limit: 20,
      });
      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          articleId: 'a1',
          userId: 'u1',
          parentId: 'p1',
          status: CommentStatus.APPROVED,
          body: { contains: 'hi', mode: 'insensitive' },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
    });

    it('paginates using page/limit', async () => {
      const prisma = buildPrismaMock();
      const repository = new CommentsRepository(prisma);
      await repository.findMany({
        filters: {},
        sortBy: CommentSortField.VOTES,
        sortOrder: SortOrder.ASC,
        page: 3,
        limit: 10,
      });
      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10, orderBy: { votes: 'asc' } })
      );
    });

    it('treats parentId: null as an explicit top-level-only filter', async () => {
      const prisma = buildPrismaMock();
      const repository = new CommentsRepository(prisma);
      await repository.findMany({
        filters: { parentId: null },
        sortBy: CommentSortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
        page: 1,
        limit: 20,
      });
      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ parentId: null }) })
      );
    });
  });

  describe('findAllForArticle', () => {
    it('queries active comments for the article, oldest first', async () => {
      const prisma = buildPrismaMock();
      const repository = new CommentsRepository(prisma);
      await repository.findAllForArticle('article-1');
      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { articleId: 'article-1', deletedAt: null },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('countDirectReplies', () => {
    it('counts active children of a comment', async () => {
      const prisma = buildPrismaMock();
      const repository = new CommentsRepository(prisma);
      await repository.countDirectReplies('c1');
      expect(prisma.comment.count).toHaveBeenCalledWith({
        where: { parentId: 'c1', deletedAt: null },
      });
    });
  });

  describe('findDirectReplies', () => {
    it('queries active direct children, oldest first', async () => {
      const prisma = buildPrismaMock();
      const repository = new CommentsRepository(prisma);
      await repository.findDirectReplies('c1');
      expect(prisma.comment.findMany).toHaveBeenCalledWith({
        where: { parentId: 'c1', deletedAt: null },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('activeWhere behavior via findMany with no filters', () => {
    it('always excludes soft-deleted rows even when no explicit filter is given', async () => {
      const prisma = buildPrismaMock();
      const repository = new CommentsRepository(prisma);
      await repository.findMany({
        filters: {},
        sortBy: CommentSortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
        page: 1,
        limit: 20,
      });
      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ deletedAt: null }) })
      );
    });

    it('omits status/article/user/parent keys entirely when not filtered', async () => {
      const prisma = buildPrismaMock();
      const repository = new CommentsRepository(prisma);
      await repository.findMany({
        filters: {},
        sortBy: CommentSortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
        page: 1,
        limit: 20,
      });
      const [[call]] = (prisma.comment.findMany as jest.Mock).mock.calls;
      expect(call.where).toEqual({ deletedAt: null });
    });
  });

  describe('softDelete / restore', () => {
    it('softDelete sets deletedAt/deletedBy', async () => {
      const prisma = buildPrismaMock();
      const repository = new CommentsRepository(prisma);
      await repository.softDelete('c1', 'actor-1');
      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { deletedAt: expect.any(Date), deletedBy: 'actor-1' },
      });
    });

    it('restore clears deletedAt/deletedBy and sets updatedBy', async () => {
      const prisma = buildPrismaMock();
      const repository = new CommentsRepository(prisma);
      await repository.restore('c1', 'actor-1');
      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { deletedAt: null, deletedBy: null, updatedBy: 'actor-1' },
      });
    });
  });

  describe('create / update', () => {
    it('create delegates straight through to prisma', async () => {
      const prisma = buildPrismaMock();
      const repository = new CommentsRepository(prisma);
      const data = { body: 'hi' } as never;
      await repository.create(data);
      expect(prisma.comment.create).toHaveBeenCalledWith({ data });
    });

    it('update delegates straight through to prisma', async () => {
      const prisma = buildPrismaMock();
      const repository = new CommentsRepository(prisma);
      const data = { body: 'edited' } as never;
      await repository.update('c1', data);
      expect(prisma.comment.update).toHaveBeenCalledWith({ where: { id: 'c1' }, data });
    });
  });

  describe('countDirectRepliesForComments (stabilization patch — N+1 fix)', () => {
    it('issues one groupBy for all ids and returns a Map', async () => {
      const prisma = buildPrismaMock();
      (prisma.comment.groupBy as jest.Mock).mockResolvedValue([
        { parentId: 'c1', _count: { _all: 2 } },
        { parentId: 'c2', _count: { _all: 0 } },
      ]);
      const repository = new CommentsRepository(prisma);
      const result = await repository.countDirectRepliesForComments(['c1', 'c2']);
      expect(prisma.comment.groupBy).toHaveBeenCalledTimes(1);
      expect(prisma.comment.groupBy).toHaveBeenCalledWith({
        by: ['parentId'],
        where: { parentId: { in: ['c1', 'c2'] }, deletedAt: null },
        _count: { _all: true },
      });
      expect(result.get('c1')).toBe(2);
      expect(result.get('c2')).toBe(0);
    });

    it('returns an empty Map without querying for an empty id list', async () => {
      const prisma = buildPrismaMock();
      const repository = new CommentsRepository(prisma);
      const result = await repository.countDirectRepliesForComments([]);
      expect(result.size).toBe(0);
      expect(prisma.comment.groupBy).not.toHaveBeenCalled();
    });
  });
});
