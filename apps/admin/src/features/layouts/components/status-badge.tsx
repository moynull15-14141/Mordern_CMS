import { Badge } from '@/components/ui/badge';
import { STATUS_BADGE_VARIANT, STATUS_LABELS } from '../constants/layout.constants';
import type { LayoutStatus } from '../types/layout';

export interface StatusBadgeProps {
  status: LayoutStatus;
}

/** Display-only — covers all 3 real `LayoutStatus` values. */
export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={STATUS_BADGE_VARIANT[status]}>{STATUS_LABELS[status]}</Badge>;
}
