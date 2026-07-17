import { ForbiddenException, Injectable } from '@nestjs/common';
import { Comment, CommentStatus } from '@prisma/client';
import { AuditLoggerService } from '../../../core/logger/audit-logger.service';
import { PaginatedResult, buildPaginatedResult } from '../../../common/dto/pagination.dto';
import { AuthorizationService } from '../../authorization/services/authorization.service';
import { PERMISSIONS } from '../../authorization/interfaces/permission.constants';
import { CommentsRepository } from '../repositories/comments.repository';
import { CommentsValidator } from '../validators/comments.validator';
import { CommentsMapper } from '../mappers/comments.mapper';
import { CommentOwnershipPolicy } from '../policies/comment-ownership.policy';
import { CommentQueryOptions } from '../interfaces/comment-query.interface';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { ApproveCommentDto } from '../dto/approve-comment.dto';
import { RejectCommentDto } from '../dto/reject-comment.dto';
import { SpamCommentDto } from '../dto/spam-comment.dto';
import { CommentResponseDto } from '../dto/comment-response.dto';
import { CommentTreeDto } from '../dto/comment-tree.dto';
import {
  CommentAlreadyDeletedException,
  CommentArticleNotFoundException,
  CommentAuthorNotFoundException,
  CommentNotDeletedException,
  CommentNotFoundException,
  ParentCommentNotFoundException,
} from '../exceptions/comment.exceptions';

interface ActingUser {
  id: string;
}

@Injectable()
export class CommentsService {
  constructor(
    private readonly repository: CommentsRepository,
    private readonly validator: CommentsValidator,
    private readonly mapper: CommentsMapper,
    private readonly authorizationService: AuthorizationService,
    private readonly auditLogger: AuditLoggerService
  ) {}

  private async getCommentOrThrow(id: string, includeDeleted = false): Promise<Comment> {
    const comment = await this.repository.findById(id, includeDeleted);
    if (!comment) {
      throw new CommentNotFoundException(id);
    }
    return comment;
  }

  private async assertCanManage(
    actor: ActingUser,
    ownerUserId: string | null,
    action: 'update' | 'delete'
  ): Promise<void> {
    const effectiveRoles = await this.authorizationService.resolveEffectiveRoles(actor.id);
    const policy = new CommentOwnershipPolicy(actor.id);
    const subject = { userId: ownerUserId };
    const allowed =
      action === 'update'
        ? policy.canUpdate(effectiveRoles, subject)
        : policy.canDelete(effectiveRoles, subject);
    if (!allowed) {
      throw new ForbiddenException(`You do not have permission to ${action} this comment.`);
    }
  }

  /** Non-moderators are always restricted to APPROVED, regardless of the
   * requested filter — see docs/49_COMMENTS_ARCHITECTURE.md "Permission
   * Flow". Moderators (`comment.moderate`) may request any status or omit
   * the filter to see every status. */
  private async resolveStatusFilter(
    actor: ActingUser,
    requested: CommentStatus | undefined
  ): Promise<CommentStatus | undefined> {
    const canModerate = await this.authorizationService.hasPermission(
      actor.id,
      PERMISSIONS.COMMENT_MODERATE
    );
    if (canModerate) {
      return requested;
    }
    return CommentStatus.APPROVED;
  }

  private async toResponseDto(comment: Comment): Promise<CommentResponseDto> {
    const replyCount = await this.repository.countDirectReplies(comment.id);
    return this.mapper.toResponseDto(comment, replyCount);
  }

  /** Batched sibling of `toResponseDto` for list-shaped results
   * (stabilization patch, post-Final-Backend-Audit — closes the N+1
   * pattern the audit flagged: 1 query per comment via
   * `Promise.all(items.map(toResponseDto))` became 1 query total,
   * regardless of list size). `getComment`/`updateComment`/etc. are
   * unchanged and still use `toResponseDto` above. */
  private async toResponseDtos(comments: Comment[]): Promise<CommentResponseDto[]> {
    if (comments.length === 0) return [];
    const replyCounts = await this.repository.countDirectRepliesForComments(
      comments.map((c) => c.id)
    );
    return comments.map((comment) =>
      this.mapper.toResponseDto(comment, replyCounts.get(comment.id) ?? 0)
    );
  }

  async createComment(dto: CreateCommentDto, actor: ActingUser): Promise<CommentResponseDto> {
    const articleExists = await this.repository.articleExists(dto.articleId);
    if (!articleExists) {
      throw new CommentArticleNotFoundException(dto.articleId);
    }

    const sanitizedBody = this.validator.assertBodyValid(dto.body);

    let parent: Comment | null = null;
    if (dto.parentId) {
      parent = await this.repository.findById(dto.parentId);
      if (!parent) {
        throw new ParentCommentNotFoundException(dto.parentId);
      }
      this.validator.assertParentBelongsToArticle(parent, dto.articleId);
    }

    const created = await this.repository.create({
      article: { connect: { id: dto.articleId } },
      user: { connect: { id: actor.id } },
      parent: parent ? { connect: { id: parent.id } } : undefined,
      body: sanitizedBody,
      status: CommentStatus.PENDING,
      createdBy: actor.id,
      updatedBy: actor.id,
    });

    this.auditLogger.record({
      actorId: actor.id,
      action: 'comment.create',
      resource: 'comment',
      resourceId: created.id,
      result: 'success',
    });
    return this.toResponseDto(created);
  }

  async getComment(id: string): Promise<CommentResponseDto> {
    const comment = await this.getCommentOrThrow(id);
    return this.toResponseDto(comment);
  }

  async listComments(
    options: CommentQueryOptions,
    actor: ActingUser
  ): Promise<PaginatedResult<CommentResponseDto>> {
    const status = await this.resolveStatusFilter(actor, options.filters.status);
    const { items, total } = await this.repository.findMany({
      ...options,
      filters: { ...options.filters, status },
    });
    const mapped = await this.toResponseDtos(items);
    return buildPaginatedResult(mapped, options.page, options.limit, total);
  }

  async listArticleComments(
    articleId: string,
    options: CommentQueryOptions,
    actor: ActingUser
  ): Promise<PaginatedResult<CommentResponseDto>> {
    const articleExists = await this.repository.articleExists(articleId);
    if (!articleExists) {
      throw new CommentArticleNotFoundException(articleId);
    }
    return this.listComments({ ...options, filters: { ...options.filters, articleId } }, actor);
  }

  async getArticleCommentTree(articleId: string): Promise<CommentTreeDto[]> {
    const articleExists = await this.repository.articleExists(articleId);
    if (!articleExists) {
      throw new CommentArticleNotFoundException(articleId);
    }
    const comments = await this.repository.findAllForArticle(articleId);
    return this.mapper.toTreeDtos(comments);
  }

  async listUserComments(
    userId: string,
    options: CommentQueryOptions,
    actor: ActingUser
  ): Promise<PaginatedResult<CommentResponseDto>> {
    const userExists = await this.repository.userExists(userId);
    if (!userExists) {
      throw new CommentAuthorNotFoundException(userId);
    }
    return this.listComments({ ...options, filters: { ...options.filters, userId } }, actor);
  }

  async listReplies(
    id: string,
    options: CommentQueryOptions,
    actor: ActingUser
  ): Promise<PaginatedResult<CommentResponseDto>> {
    await this.getCommentOrThrow(id);
    return this.listComments({ ...options, filters: { ...options.filters, parentId: id } }, actor);
  }

  async updateComment(
    id: string,
    dto: UpdateCommentDto,
    actor: ActingUser
  ): Promise<CommentResponseDto> {
    const existing = await this.getCommentOrThrow(id);
    await this.assertCanManage(actor, existing.userId, 'update');
    const sanitizedBody = this.validator.assertBodyValid(dto.body);

    const updated = await this.repository.update(id, { body: sanitizedBody, updatedBy: actor.id });
    this.auditLogger.record({
      actorId: actor.id,
      action: 'comment.update',
      resource: 'comment',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(updated);
  }

  async deleteComment(id: string, actor: ActingUser): Promise<CommentResponseDto> {
    const existing = await this.getCommentOrThrow(id);
    if (existing.deletedAt) {
      throw new CommentAlreadyDeletedException(id);
    }
    await this.assertCanManage(actor, existing.userId, 'delete');

    await this.repository.softDelete(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'comment.delete',
      resource: 'comment',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(await this.getCommentOrThrow(id, true));
  }

  async restoreComment(id: string, actor: ActingUser): Promise<CommentResponseDto> {
    const existing = await this.getCommentOrThrow(id, true);
    if (!existing.deletedAt) {
      throw new CommentNotDeletedException(id);
    }
    await this.assertCanManage(actor, existing.userId, 'update');

    await this.repository.restore(id, actor.id);
    this.auditLogger.record({
      actorId: actor.id,
      action: 'comment.restore',
      resource: 'comment',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(await this.getCommentOrThrow(id));
  }

  async approveComment(
    id: string,
    dto: ApproveCommentDto,
    actor: ActingUser
  ): Promise<CommentResponseDto> {
    await this.getCommentOrThrow(id);
    const updated = await this.repository.update(id, {
      status: CommentStatus.APPROVED,
      moderationReason: dto.reason ?? null,
      updatedBy: actor.id,
    });
    this.auditLogger.record({
      actorId: actor.id,
      action: 'comment.approve',
      resource: 'comment',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(updated);
  }

  async rejectComment(
    id: string,
    dto: RejectCommentDto,
    actor: ActingUser
  ): Promise<CommentResponseDto> {
    await this.getCommentOrThrow(id);
    const updated = await this.repository.update(id, {
      status: CommentStatus.REJECTED,
      moderationReason: dto.reason,
      updatedBy: actor.id,
    });
    this.auditLogger.record({
      actorId: actor.id,
      action: 'comment.reject',
      resource: 'comment',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(updated);
  }

  async markSpam(id: string, dto: SpamCommentDto, actor: ActingUser): Promise<CommentResponseDto> {
    await this.getCommentOrThrow(id);
    const updated = await this.repository.update(id, {
      status: CommentStatus.SPAM,
      moderationReason: dto.reason ?? null,
      updatedBy: actor.id,
    });
    this.auditLogger.record({
      actorId: actor.id,
      action: 'comment.spam',
      resource: 'comment',
      resourceId: id,
      result: 'success',
    });
    return this.toResponseDto(updated);
  }
}
