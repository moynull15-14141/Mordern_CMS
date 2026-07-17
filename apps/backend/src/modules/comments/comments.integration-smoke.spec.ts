import { CommentStatus } from '@prisma/client';
import { SystemRole } from '../authorization/interfaces/system-role.enum';
import { AuthorizationService } from '../authorization/services/authorization.service';
import { AuditLoggerService } from '../../core/logger/audit-logger.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { CommentsRepository } from './repositories/comments.repository';
import { CommentsValidator } from './validators/comments.validator';
import { CommentsMapper } from './mappers/comments.mapper';
import { CommentsService } from './services/comments.service';
import { CommentsController } from './controllers/comments.controller';
import { ArticleCommentsController } from './controllers/article-comments.controller';
import { CommentSortField } from './constants/comment.constants';
import { SortOrder } from '../../common/dto/pagination.dto';

/**
 * Integration smoke test — wires the real Repository/Validator/Mapper/
 * Service/Controllers together (only `PrismaService` and
 * `AuthorizationService` are faked, an in-memory Map standing in for the
 * database), exercising the full create -> read -> moderate -> reply ->
 * tree -> delete -> restore lifecycle end-to-end through actual class
 * instances rather than fully-mocked units.
 */
function buildInMemoryPrisma() {
  const comments = new Map<string, Record<string, unknown>>();
  let counter = 0;

  const clone = (c: Record<string, unknown>) => ({ ...c });

  return {
    article: { findFirst: jest.fn().mockResolvedValue({ id: 'article-1' }) },
    user: { findFirst: jest.fn().mockResolvedValue({ id: 'user-1' }) },
    comment: {
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        counter += 1;
        const id = `comment-${counter}`;
        const now = new Date();
        const record = {
          id,
          articleId: (data.article as { connect: { id: string } }).connect.id,
          userId: (data.user as { connect: { id: string } } | undefined)?.connect.id ?? null,
          authorName: null,
          authorEmail: null,
          parentId: (data.parent as { connect: { id: string } } | undefined)?.connect.id ?? null,
          body: data.body,
          status: data.status,
          moderationReason: null,
          votes: 0,
          createdAt: now,
          createdBy: data.createdBy ?? null,
          updatedAt: now,
          updatedBy: data.updatedBy ?? null,
          deletedAt: null,
          deletedBy: null,
        };
        comments.set(id, record);
        return clone(record);
      }),
      findFirst: jest.fn(async ({ where }: { where: { id: string; deletedAt?: null } }) => {
        const record = comments.get(where.id);
        if (!record) return null;
        if ('deletedAt' in where && record.deletedAt !== null) return null;
        return clone(record);
      }),
      findMany: jest.fn(async ({ where }: { where: Record<string, unknown> }) => {
        return Array.from(comments.values())
          .filter((c) => (where.articleId ? c.articleId === where.articleId : true))
          .filter((c) => (where.parentId !== undefined ? c.parentId === where.parentId : true))
          .filter((c) => (where.status ? c.status === where.status : true))
          .filter((c) => (where.deletedAt === null ? c.deletedAt === null : true))
          .map(clone);
      }),
      count: jest.fn(async ({ where }: { where: Record<string, unknown> }) => {
        return Array.from(comments.values()).filter((c) =>
          where.parentId ? c.parentId === where.parentId : true
        ).length;
      }),
      groupBy: jest.fn(
        async ({ where }: { where: { parentId?: { in: string[] }; deletedAt: null } }) => {
          const parentIds = where.parentId?.in ?? [];
          return parentIds
            .map((parentId) => ({
              parentId,
              _count: {
                _all: Array.from(comments.values()).filter(
                  (c) => c.parentId === parentId && c.deletedAt === null
                ).length,
              },
            }))
            .filter((row) => row._count._all > 0);
        }
      ),
      update: jest.fn(
        async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
          const existing = comments.get(where.id)!;
          const updated = { ...existing, ...data };
          comments.set(where.id, updated);
          return clone(updated);
        }
      ),
    },
  } as unknown as PrismaService;
}

describe('Comments module — integration smoke', () => {
  function buildStack(roles: string[], canModerate: boolean) {
    const prisma = buildInMemoryPrisma();
    const repository = new CommentsRepository(prisma);
    const validator = new CommentsValidator();
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
    const controller = new CommentsController(service);
    const articleController = new ArticleCommentsController(service);
    return { service, controller, articleController };
  }

  const listQuery = (extra: Record<string, unknown> = {}) => ({
    filters: {},
    sortBy: CommentSortField.CREATED_AT,
    sortOrder: SortOrder.DESC,
    page: 1,
    limit: 20,
    ...extra,
  });

  it('creates a top-level comment as PENDING via the controller', async () => {
    const { controller } = buildStack([SystemRole.SUBSCRIBER], false);
    const created = await controller.createComment(
      { articleId: 'article-1', body: 'Nice article!' },
      { id: 'user-1' } as never
    );
    expect(created.status).toBe(CommentStatus.PENDING);
    expect(created.body).toBe('Nice article!');
  });

  it('a non-moderator cannot see a PENDING comment in the list (forced to APPROVED)', async () => {
    const { controller } = buildStack([SystemRole.SUBSCRIBER], false);
    await controller.createComment({ articleId: 'article-1', body: 'pending one' }, {
      id: 'user-1',
    } as never);
    const list = await controller.listComments(listQuery() as never, { id: 'user-1' } as never);
    expect(list.items).toHaveLength(0);
  });

  it('a moderator can approve the comment, after which it is visible in a non-moderator’s list', async () => {
    const { controller } = buildStack([SystemRole.MODERATOR], true);
    const created = await controller.createComment(
      { articleId: 'article-1', body: 'to be approved' },
      { id: 'user-1' } as never
    );

    const approved = await controller.approveComment(created.id, {}, { id: 'mod-1' } as never);
    expect(approved.status).toBe(CommentStatus.APPROVED);

    const list = await controller.listComments(listQuery() as never, { id: 'user-1' } as never);
    expect(list.items.some((c) => c.id === created.id)).toBe(true);
  });

  it('a reply is correctly linked to its parent and counted in replyCount', async () => {
    const { controller } = buildStack([SystemRole.SUBSCRIBER], false);
    const parent = await controller.createComment({ articleId: 'article-1', body: 'root' }, {
      id: 'user-1',
    } as never);
    await controller.createComment(
      { articleId: 'article-1', parentId: parent.id, body: 'a reply' },
      { id: 'user-2' } as never
    );

    const refreshed = await controller.getComment(parent.id);
    expect(refreshed.replyCount).toBe(1);
  });

  it('the owner can edit their own comment', async () => {
    const { controller } = buildStack([SystemRole.SUBSCRIBER], false);
    const created = await controller.createComment({ articleId: 'article-1', body: 'original' }, {
      id: 'user-1',
    } as never);
    const updated = await controller.updateComment(created.id, { body: 'edited' }, {
      id: 'user-1',
    } as never);
    expect(updated.body).toBe('edited');
  });

  it('a non-owner cannot delete another user’s comment', async () => {
    const { controller } = buildStack([SystemRole.SUBSCRIBER], false);
    const created = await controller.createComment({ articleId: 'article-1', body: 'mine' }, {
      id: 'user-1',
    } as never);
    await expect(controller.deleteComment(created.id, { id: 'user-2' } as never)).rejects.toThrow();
  });

  it('the owner can delete and then restore their own comment', async () => {
    const { controller } = buildStack([SystemRole.SUBSCRIBER], false);
    const created = await controller.createComment({ articleId: 'article-1', body: 'delete me' }, {
      id: 'user-1',
    } as never);

    const deleted = await controller.deleteComment(created.id, { id: 'user-1' } as never);
    expect(deleted.deletedAt).not.toBeNull();

    const restored = await controller.restoreComment(created.id, { id: 'user-1' } as never);
    expect(restored.deletedAt).toBeNull();
  });

  it('the full article comment tree nests replies under their parent', async () => {
    const { controller, articleController } = buildStack([SystemRole.SUBSCRIBER], false);
    const root = await controller.createComment({ articleId: 'article-1', body: 'root' }, {
      id: 'user-1',
    } as never);
    await controller.createComment({ articleId: 'article-1', parentId: root.id, body: 'child' }, {
      id: 'user-2',
    } as never);

    const tree = await articleController.getArticleCommentTree('article-1');
    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].body).toBe('child');
  });
});
