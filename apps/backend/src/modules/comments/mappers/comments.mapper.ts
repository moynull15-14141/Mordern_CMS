import { Injectable } from '@nestjs/common';
import { Comment } from '@prisma/client';
import { CommentResponseDto } from '../dto/comment-response.dto';
import { CommentTreeDto } from '../dto/comment-tree.dto';
import { buildCommentTree, CommentTreeNode } from '../utils/comment-tree.util';

@Injectable()
export class CommentsMapper {
  toResponseDto(comment: Comment, replyCount: number): CommentResponseDto {
    return {
      id: comment.id,
      articleId: comment.articleId,
      userId: comment.userId,
      authorName: comment.authorName,
      authorEmail: comment.authorEmail,
      parentId: comment.parentId,
      body: comment.body,
      status: comment.status,
      moderationReason: comment.moderationReason,
      votes: comment.votes,
      replyCount,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      deletedAt: comment.deletedAt?.toISOString() ?? null,
    };
  }

  /** Builds the full nested tree for an article's comments. `replyCount` on
   * every node is the number of direct children, derived from the same
   * flat list — no extra query. */
  toTreeDtos(comments: Comment[], rootParentId: string | null = null): CommentTreeDto[] {
    const directChildCount = new Map<string, number>();
    for (const comment of comments) {
      if (comment.parentId) {
        directChildCount.set(comment.parentId, (directChildCount.get(comment.parentId) ?? 0) + 1);
      }
    }

    const tree = buildCommentTree(comments, rootParentId);
    const toDto = (node: CommentTreeNode<Comment>): CommentTreeDto => ({
      ...this.toResponseDto(node, directChildCount.get(node.id) ?? 0),
      children: node.children.map(toDto),
    });

    return tree.map(toDto);
  }
}
