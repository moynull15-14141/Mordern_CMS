import { resourceKeys } from '@/constants/query-keys';
import type { CommentFilters } from '../types/comment';

const base = resourceKeys('comments');

export const commentsKeys = {
  ...base,
  list: (filters: CommentFilters) => [...base.lists(), filters] as const,
  replies: (commentId: string, filters: CommentFilters) => ['comments', commentId, 'replies', filters] as const,
  articleComments: (articleId: string, filters: CommentFilters) => ['comments', 'article', articleId, filters] as const,
  articleTree: (articleId: string) => ['comments', 'article', articleId, 'tree'] as const,
  userComments: (userId: string, filters: CommentFilters) => ['comments', 'user', userId, filters] as const,
};
