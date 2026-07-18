import { Badge } from '@/components/ui/badge';
import { STATUS_BADGE_VARIANT, STATUS_LABELS } from '../constants/media.constants';
import type { MediaStatus } from '../types/media';

export interface StatusBadgeProps {
  status: MediaStatus;
}

/** Display-only — covers all 4 real `MediaStatus` values. */
export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={STATUS_BADGE_VARIANT[status]}>{STATUS_LABELS[status]}</Badge>;
}
