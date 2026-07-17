import { ForbiddenException } from '@nestjs/common';
import { Comment, CommentStatus } from '@prisma/client';
import { SortOrder } from '../../../common/dto/pagination.dto';
import { SystemRole } from '../../authorization/interfaces/system-role.enum';
import { AuthorizationService } from '../../authorization/services/authorization.service';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { CommentSortField } from '../constants/comment.constants';
import { CommentsRepository } from '../repositories/comments.repository';
import { CommentsValidator } from '../validators/comments.validator';
import { CommentsMapper } from '../mappers/comments.mapper';
import { CommentsService } from './comments.service';
import {
  CommentAlreadyDeletedException,
  CommentArticleNotFoundException,
  CommentAuthorNotFoundException,
  CommentNotDeletedException,
  CommentNotFoundException,
  ParentCommentNotFoundException,
} from '../exceptions/comment.exceptions';

function buildComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 'c1',
    articleId: 'article-1',
    userId: 'user-1',
    authorName: null,
    authorEmail: null,
    parentId: null,
    body: 'hello',
    status: CommentStatus.PENDING,
    moderationReason: null,
    votes: 0,
    createdAt: new Date('2026-01-01'),
    createdBy: 'user-1',
    updatedAt: new Date('2026-01-01'),
    updatedBy: 'user-1',
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  } as Comment;
}

function buildService(roles: string[] = [SystemRole.SUBSCRIBER], canModerate = false) {
  const repository = {
    articleExists: jest.fn().mockResolvedValue(true),
    userExists: jest.fn().mockResolvedValue(true),
    findById: jest.fn(),
    findMany: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    findAllForArticle: jest.fn().mockResolvedValue([]),
    countDirectReplies: jest.fn().mockResolvedValue(0),
    countDirectRepliesForComments: jest.fn().mockResolvedValue(new Map()),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
  } as unknown as CommentsRepository;

  const validator = {
    assertBodyValid: jest.fn((body: string) => body.trim()),
    assertParentBelongsToArticle: jest.fn(),
  } as unknown as CommentsValidator;

  const mapper = new CommentsMapper();

  const authorizationService = {
    resolveEffectiveRoles: jest.fn().mockResolvedValue(roles),
    hasPermission: jest.fn().mockResolvedValue(canModerate),
  } as unknown as AuthorizationService;

  const auditLogger = { record: jest.fn() } as unknown as AuditLoggerService;

  const service = new CommentsService(
    repository,
    validator,
    mapper,
    authorizationService,
    auditLogger
  );
  return { service, repository, validator, authorizationService, auditLogger };
}

describe('CommentsService', () => {
  describe('createComment', () => {
    it('creates a top-level comment authored by the actor', async () => {
      const { service, repository, auditLogger } = buildService();
      (repository.create as jest.Mock).mockResolvedValue(buildComment());

      const result = await service.createComment(
        { articleId: 'article-1', body: 'hello' },
        { id: 'user-1' }
      );

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          body: 'hello',
          status: CommentStatus.PENDING,
          createdBy: 'user-1',
          updatedBy: 'user-1',
        })
      );
      expect(result.id).toBe('c1');
      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'comment.create' })
      );
    });

    it('throws when the article does not exist', async () => {
      const { service, repository } = buildService();
      (repository.articleExists as jest.Mock).mockResolvedValue(false);
      await expect(
        service.createComment({ articleId: 'missing', body: 'hi' }, { id: 'user-1' })
      ).rejects.toThrow(CommentArticleNotFoundException);
    });

    it('throws when the parent comment does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(
        service.createComment(
          { articleId: 'article-1', parentId: 'missing', body: 'hi' },
          { id: 'user-1' }
        )
      ).rejects.toThrow(ParentCommentNotFoundException);
    });

    it('validates the parent belongs to the same article when a parent is given', async () => {
      const { service, repository, validator } = buildService();
      const parent = buildComment({ id: 'parent-1', articleId: 'article-1' });
      (repository.findById as jest.Mock).mockResolvedValue(parent);
      (repository.create as jest.Mock).mockResolvedValue(buildComment({ parentId: 'parent-1' }));

      await service.createComment(
        { articleId: 'article-1', parentId: 'parent-1', body: 'hi' },
        { id: 'user-1' }
      );

      expect(validator.assertParentBelongsToArticle).toHaveBeenCalledWith(parent, 'article-1');
    });
  });

  describe('getComment', () => {
    it('returns the mapped comment', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildComment());
      const result = await service.getComment('c1');
      expect(result.id).toBe('c1');
    });

    it('throws CommentNotFoundException when missing', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.getComment('missing')).rejects.toThrow(CommentNotFoundException);
    });
  });

  describe('listComments — batched reply counts (stabilization patch — N+1 fix)', () => {
    it('issues exactly one batched countDirectRepliesForComments call, not one per comment', async () => {
      const { service, repository } = buildService([SystemRole.MODERATOR], true);
      const items = [
        buildComment({ id: 'c1' }),
        buildComment({ id: 'c2' }),
        buildComment({ id: 'c3' }),
      ];
      (repository.findMany as jest.Mock).mockResolvedValue({ items, total: 3 });

      const result = await service.listComments(
        {
          filters: {},
          sortBy: CommentSortField.CREATED_AT,
          sortOrder: SortOrder.DESC,
          page: 1,
          limit: 20,
        },
        { id: 'mod-1' }
      );

      expect(result.items).toHaveLength(3);
      expect(repository.countDirectRepliesForComments).toHaveBeenCalledTimes(1);
      expect(repository.countDirectRepliesForComments).toHaveBeenCalledWith(['c1', 'c2', 'c3']);
      expect(repository.countDirectReplies).not.toHaveBeenCalled();
    });
  });

  describe('listComments — status restriction', () => {
    it('forces status to APPROVED for a non-moderator regardless of requested filter', async () => {
      const { service, repository } = buildService([SystemRole.SUBSCRIBER], false);
      await service.listComments(
        {
          filters: { status: CommentStatus.PENDING },
          sortBy: CommentSortField.CREATED_AT,
          sortOrder: SortOrder.DESC,
          page: 1,
          limit: 20,
        },
        { id: 'user-1' }
      );
      expect(repository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({ status: CommentStatus.APPROVED }),
        })
      );
    });

    it('respects the requested status filter for a moderator', async () => {
      const { service, repository } = buildService([SystemRole.MODERATOR], true);
      await service.listComments(
        {
          filters: { status: CommentStatus.PENDING },
          sortBy: CommentSortField.CREATED_AT,
          sortOrder: SortOrder.DESC,
          page: 1,
          limit: 20,
        },
        { id: 'mod-1' }
      );
      expect(repository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({ status: CommentStatus.PENDING }),
        })
      );
    });

    it('leaves status undefined for a moderator who requested no filter (sees every status)', async () => {
      const { service, repository } = buildService([SystemRole.MODERATOR], true);
      await service.listComments(
        {
          filters: {},
          sortBy: CommentSortField.CREATED_AT,
          sortOrder: SortOrder.DESC,
          page: 1,
          limit: 20,
        },
        { id: 'mod-1' }
      );
      expect(repository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ filters: expect.objectContaining({ status: undefined }) })
      );
    });
  });

  describe('listArticleComments', () => {
    it('throws when the article does not exist', async () => {
      const { service, repository } = buildService();
      (repository.articleExists as jest.Mock).mockResolvedValue(false);
      await expect(
        service.listArticleComments(
          'missing',
          {
            filters: {},
            sortBy: CommentSortField.CREATED_AT,
            sortOrder: SortOrder.DESC,
            page: 1,
            limit: 20,
          },
          {
            id: 'user-1',
          }
        )
      ).rejects.toThrow(CommentArticleNotFoundException);
    });
  });

  describe('getArticleCommentTree', () => {
    it('throws when the article does not exist', async () => {
      const { service, repository } = buildService();
      (repository.articleExists as jest.Mock).mockResolvedValue(false);
      await expect(service.getArticleCommentTree('missing')).rejects.toThrow(
        CommentArticleNotFoundException
      );
    });

    it('builds the tree from the article’s flat comment list', async () => {
      const { service, repository } = buildService();
      (repository.findAllForArticle as jest.Mock).mockResolvedValue([
        buildComment({ id: 'a' }),
        buildComment({ id: 'a1', parentId: 'a' }),
      ]);
      const tree = await service.getArticleCommentTree('article-1');
      expect(tree).toHaveLength(1);
      expect(tree[0].children).toHaveLength(1);
    });
  });

  describe('listUserComments', () => {
    it('throws when the user does not exist', async () => {
      const { service, repository } = buildService();
      (repository.userExists as jest.Mock).mockResolvedValue(false);
      await expect(
        service.listUserComments(
          'missing',
          {
            filters: {},
            sortBy: CommentSortField.CREATED_AT,
            sortOrder: SortOrder.DESC,
            page: 1,
            limit: 20,
          },
          {
            id: 'user-1',
          }
        )
      ).rejects.toThrow(CommentAuthorNotFoundException);
    });
  });

  describe('listReplies', () => {
    it('throws when the parent comment does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(
        service.listReplies(
          'missing',
          {
            filters: {},
            sortBy: CommentSortField.CREATED_AT,
            sortOrder: SortOrder.DESC,
            page: 1,
            limit: 20,
          },
          {
            id: 'user-1',
          }
        )
      ).rejects.toThrow(CommentNotFoundException);
    });
  });

  describe('updateComment', () => {
    it('allows the owner to update their own comment', async () => {
      const { service, repository } = buildService([SystemRole.SUBSCRIBER]);
      (repository.findById as jest.Mock).mockResolvedValue(buildComment({ userId: 'user-1' }));
      (repository.update as jest.Mock).mockResolvedValue(buildComment({ body: 'edited' }));

      const result = await service.updateComment('c1', { body: 'edited' }, { id: 'user-1' });
      expect(result.body).toBe('edited');
    });

    it('denies a non-owner without a broad role', async () => {
      const { service, repository } = buildService([SystemRole.SUBSCRIBER]);
      (repository.findById as jest.Mock).mockResolvedValue(
        buildComment({ userId: 'someone-else' })
      );
      await expect(
        service.updateComment('c1', { body: 'edited' }, { id: 'user-1' })
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows a Moderator to update someone else’s comment', async () => {
      const { service, repository } = buildService([SystemRole.MODERATOR]);
      (repository.findById as jest.Mock).mockResolvedValue(
        buildComment({ userId: 'someone-else' })
      );
      (repository.update as jest.Mock).mockResolvedValue(buildComment({ body: 'edited' }));
      await expect(
        service.updateComment('c1', { body: 'edited' }, { id: 'mod-1' })
      ).resolves.toBeDefined();
    });

    it('throws when the comment does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(
        service.updateComment('missing', { body: 'x' }, { id: 'user-1' })
      ).rejects.toThrow(CommentNotFoundException);
    });
  });

  describe('deleteComment', () => {
    it('soft-deletes when owned by the actor', async () => {
      const { service, repository, auditLogger } = buildService([SystemRole.SUBSCRIBER]);
      (repository.findById as jest.Mock)
        .mockResolvedValueOnce(buildComment({ userId: 'user-1' }))
        .mockResolvedValueOnce(buildComment({ userId: 'user-1', deletedAt: new Date() }));

      await service.deleteComment('c1', { id: 'user-1' });

      expect(repository.softDelete).toHaveBeenCalledWith('c1', 'user-1');
      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'comment.delete' })
      );
    });

    it('throws when already deleted', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildComment({ deletedAt: new Date() }));
      await expect(service.deleteComment('c1', { id: 'user-1' })).rejects.toThrow(
        CommentAlreadyDeletedException
      );
    });

    it('denies a non-owner without a broad role', async () => {
      const { service, repository } = buildService([SystemRole.SUBSCRIBER]);
      (repository.findById as jest.Mock).mockResolvedValue(
        buildComment({ userId: 'someone-else' })
      );
      await expect(service.deleteComment('c1', { id: 'user-1' })).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('restoreComment', () => {
    it('restores when permitted', async () => {
      const { service, repository, auditLogger } = buildService([SystemRole.SUBSCRIBER]);
      (repository.findById as jest.Mock)
        .mockResolvedValueOnce(buildComment({ userId: 'user-1', deletedAt: new Date() }))
        .mockResolvedValueOnce(buildComment({ userId: 'user-1', deletedAt: null }));

      await service.restoreComment('c1', { id: 'user-1' });

      expect(repository.restore).toHaveBeenCalledWith('c1', 'user-1');
      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'comment.restore' })
      );
    });

    it('throws when not deleted', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildComment({ deletedAt: null }));
      await expect(service.restoreComment('c1', { id: 'user-1' })).rejects.toThrow(
        CommentNotDeletedException
      );
    });
  });

  describe('approveComment', () => {
    it('sets status APPROVED and stores the optional reason', async () => {
      const { service, repository, auditLogger } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildComment());
      (repository.update as jest.Mock).mockResolvedValue(
        buildComment({ status: CommentStatus.APPROVED })
      );

      const result = await service.approveComment('c1', { reason: 'looks good' }, { id: 'mod-1' });

      expect(repository.update).toHaveBeenCalledWith('c1', {
        status: CommentStatus.APPROVED,
        moderationReason: 'looks good',
        updatedBy: 'mod-1',
      });
      expect(result.status).toBe(CommentStatus.APPROVED);
      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'comment.approve' })
      );
    });

    it('throws when the comment does not exist', async () => {
      const { service, repository } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(null);
      await expect(service.approveComment('missing', {}, { id: 'mod-1' })).rejects.toThrow(
        CommentNotFoundException
      );
    });
  });

  describe('rejectComment', () => {
    it('sets status REJECTED with the required reason', async () => {
      const { service, repository, auditLogger } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildComment());
      (repository.update as jest.Mock).mockResolvedValue(
        buildComment({ status: CommentStatus.REJECTED })
      );

      const result = await service.rejectComment('c1', { reason: 'off-topic' }, { id: 'mod-1' });

      expect(repository.update).toHaveBeenCalledWith('c1', {
        status: CommentStatus.REJECTED,
        moderationReason: 'off-topic',
        updatedBy: 'mod-1',
      });
      expect(result.status).toBe(CommentStatus.REJECTED);
      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'comment.reject' })
      );
    });
  });

  describe('markSpam', () => {
    it('sets status SPAM', async () => {
      const { service, repository, auditLogger } = buildService();
      (repository.findById as jest.Mock).mockResolvedValue(buildComment());
      (repository.update as jest.Mock).mockResolvedValue(
        buildComment({ status: CommentStatus.SPAM })
      );

      const result = await service.markSpam('c1', {}, { id: 'mod-1' });

      expect(repository.update).toHaveBeenCalledWith('c1', {
        status: CommentStatus.SPAM,
        moderationReason: null,
        updatedBy: 'mod-1',
      });
      expect(result.status).toBe(CommentStatus.SPAM);
      expect(auditLogger.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'comment.spam' })
      );
    });
  });
});
