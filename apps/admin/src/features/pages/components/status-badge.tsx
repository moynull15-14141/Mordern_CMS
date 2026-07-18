import { Badge } from '@/components/ui/badge';
import { STATUS_BADGE_VARIANT, STATUS_LABELS } from '../constants/page.constants';
import type { ContentStatus } from '../types/page';

export interface StatusBadgeProps {
  status: ContentStatus;
}

/** Display-only — covers all 6 real `ContentStatus` values. */
export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={STATUS_BADGE_VARIANT[status]}>{STATUS_LABELS[status]}</Badge>;
}
