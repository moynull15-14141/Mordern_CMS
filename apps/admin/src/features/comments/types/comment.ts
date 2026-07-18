import type { CommentSortField, CommentStatus, SortOrder } from '../constants/comments.constants';

export interface Comment {
  id: string;
  articleId: string;
  userId: string | null;
  authorName: string | null;
  authorEmail: string | null;
  parentId: string | null;
  body: string;
  status: CommentStatus;
  moderationReason: string | null;
  votes: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CommentTree extends Comment {
  children: CommentTree[];
}

export interface CommentFilters {
  page?: number;
  limit?: number;
  search?: string;
  articleId?: string;
  userId?: string;
  parentId?: string | null;
  status?: CommentStatus;
  sortBy?: CommentSortField;
  sortOrder?: SortOrder;
}

export interface CreateCommentInput {
  articleId: string;
  parentId?: string;
  body: string;
}

export interface UpdateCommentInput {
  body: string;
}

export interface ApproveCommentInput {
  reason?: string;
}

export interface RejectCommentInput {
  reason: string;
}

export interface SpamCommentInput {
  reason?: string;
}
