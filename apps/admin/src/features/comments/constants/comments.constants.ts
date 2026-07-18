export type CommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
export type CommentSortField = 'createdAt' | 'updatedAt' | 'votes';
export type SortOrder = 'asc' | 'desc';

export const COMMENTS_DEFAULT_PAGE_SIZE = 20;
export const COMMENT_BODY_MIN_LENGTH = 1;
export const COMMENT_BODY_MAX_LENGTH = 5000;
export const COMMENT_MODERATION_REASON_MAX_LENGTH = 1000;

export const COMMENT_STATUS_LABELS: Record<CommentStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SPAM: 'Spam',
};

export const COMMENT_STATUS_BADGE_VARIANT: Record<CommentStatus, 'warning' | 'success' | 'destructive'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'destructive',
  SPAM: 'destructive',
};

export const COMMENT_SORT_OPTIONS: Array<{ value: CommentSortField; label: string }> = [
  { value: 'createdAt', label: 'Created' },
  { value: 'updatedAt', label: 'Updated' },
  { value: 'votes', label: 'Votes' },
];

export const COMMENT_STATUS_OPTIONS: Array<{ value: CommentStatus; label: string }> = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'SPAM', label: 'Spam' },
];
