import { Injectable } from '@nestjs/common';
import { Comment, Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { CommentQueryOptions } from '../interfaces/comment-query.interface';

/**
 * Full CRUD for `Comment` — no schema change. Article/User existence
 * checks query those tables directly (not via ArticlesModule/UsersModule
 * repositories), mirroring how Articles validated Category/Tag/Author
 * existence directly rather than importing those modules — see
 * docs/49_COMMENTS_ARCHITECTURE.md "Conflict Resolution".
 */
@Injectable()
export class CommentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private activeWhere(): Prisma.CommentWhereInput {
    return { deletedAt: null };
  }

  async articleExists(articleId: string): Promise<boolean> {
    const article = await this.prisma.article.findFirst({
      where: { id: articleId, deletedAt: null },
      select: { id: true },
    });
    return article !== null;
  }

  async userExists(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true },
    });
    return user !== null;
  }

  async findById(id: string, includeDeleted = false): Promise<Comment | null> {
    return this.prisma.comment.findFirst({
      where: { id, ...(includeDeleted ? {} : this.activeWhere()) },
    });
  }

  private buildWhere(options: CommentQueryOptions): Prisma.CommentWhereInput {
    const { filters } = options;
    const where: Prisma.CommentWhereInput = { deletedAt: null };

    if (filters.articleId) where.articleId = filters.articleId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.parentId !== undefined) where.parentId = filters.parentId;
    if (filters.status) where.status = filters.status;
    if (filters.search) where.body = { contains: filters.search, mode: 'insensitive' };

    return where;
  }

  async findMany(options: CommentQueryOptions): Promise<{ items: Comment[]; total: number }> {
    const where = this.buildWhere(options);
    const orderBy = { [options.sortBy]: options.sortOrder };
    const skip = (options.page - 1) * options.limit;

    const [items, total] = await Promise.all([
      this.prisma.comment.findMany({ where, orderBy, skip, take: options.limit }),
      this.prisma.comment.count({ where }),
    ]);

    return { items, total };
  }

  /** Every active comment on an article, flat — used to build the reply
   * tree in memory (see `utils/comment-tree.util.ts`), same "fetch small
   * flat list once" strategy Categories/Media use for hierarchy. */
  async findAllForArticle(articleId: string): Promise<Comment[]> {
    return this.prisma.comment.findMany({
      where: { articleId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }

  async countDirectReplies(commentId: string): Promise<number> {
    return this.prisma.comment.count({ where: { parentId: commentId, deletedAt: null } });
  }

  /** Batched sibling of `countDirectReplies` — one `groupBy` for all ids
   * instead of one `count` per comment, used by `CommentsService.listComments()`
   * to close the N+1 pattern the Final Backend Architecture Audit flagged.
   * The single-id method above is unchanged and still used by every
   * single-comment call site (`getComment`, `updateComment`, etc.). */
  async countDirectRepliesForComments(commentIds: string[]): Promise<Map<string, number>> {
    if (commentIds.length === 0) return new Map();
    const grouped = await this.prisma.comment.groupBy({
      by: ['parentId'],
      where: { parentId: { in: commentIds }, deletedAt: null },
      _count: { _all: true },
    });
    const counts = new Map<string, number>();
    for (const row of grouped) {
      if (row.parentId) counts.set(row.parentId, row._count._all);
    }
    return counts;
  }

  async findDirectReplies(commentId: string): Promise<Comment[]> {
    return this.prisma.comment.findMany({
      where: { parentId: commentId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(data: Prisma.CommentCreateInput): Promise<Comment> {
    return this.prisma.comment.create({ data });
  }

  async update(id: string, data: Prisma.CommentUpdateInput): Promise<Comment> {
    return this.prisma.comment.update({ where: { id }, data });
  }

  async softDelete(id: string, actorId: string | null): Promise<Comment> {
    return this.prisma.comment.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actorId },
    });
  }

  async restore(id: string, actorId: string | null): Promise<Comment> {
    return this.prisma.comment.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, updatedBy: actorId },
    });
  }
}
