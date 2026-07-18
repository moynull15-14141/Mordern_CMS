export { CommentsPageContent } from './components/comments-page-content';
export { CommentDetailPageContent } from './components/comment-detail-page-content';
export { CommentTable } from './components/comment-table';
export { CommentFilters, type CommentFiltersValue } from './components/comment-filters';
export { CommentStatusBadge } from './components/comment-status-badge';
export { CommentFormDialog } from './components/comment-form-dialog';
export { CommentReasonDialog } from './components/comment-reason-dialog';

export { useComments } from './hooks/use-comments';
export { useComment } from './hooks/use-comment';
export { useCommentReplies } from './hooks/use-comment-replies';
export { useArticleComments } from './hooks/use-article-comments';
export { useArticleCommentTree } from './hooks/use-article-comment-tree';
export { useUserComments } from './hooks/use-user-comments';
export { useCreateComment } from './hooks/use-create-comment';
export { useUpdateComment } from './hooks/use-update-comment';
export { useDeleteComment } from './hooks/use-delete-comment';
export { useRestoreComment } from './hooks/use-restore-comment';
export { useApproveComment } from './hooks/use-approve-comment';
export { useRejectComment } from './hooks/use-reject-comment';
export { useSpamComment } from './hooks/use-spam-comment';

export type {
  Comment,
  CommentTree,
  CommentFilters as CommentFiltersType,
  CreateCommentInput,
  UpdateCommentInput,
  ApproveCommentInput,
  RejectCommentInput,
  SpamCommentInput,
} from './types/comment';

export {
  COMMENTS_DEFAULT_PAGE_SIZE,
  COMMENT_SORT_OPTIONS,
  COMMENT_STATUS_OPTIONS,
  COMMENT_STATUS_LABELS,
  type CommentSortField,
  type CommentStatus,
} from './constants/comments.constants';
