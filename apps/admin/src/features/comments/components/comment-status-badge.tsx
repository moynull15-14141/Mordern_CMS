import { Badge } from '@/components/ui/badge';
import { COMMENT_STATUS_BADGE_VARIANT, COMMENT_STATUS_LABELS, type CommentStatus } from '../constants/comments.constants';

export interface CommentStatusBadgeProps {
  status: CommentStatus;
}

export function CommentStatusBadge({ status }: CommentStatusBadgeProps) {
  return <Badge variant={COMMENT_STATUS_BADGE_VARIANT[status]}>{COMMENT_STATUS_LABELS[status]}</Badge>;
}
