import { Badge } from '@/components/ui/badge';
import { STATUS_BADGE_VARIANT, STATUS_LABELS } from '../constants/category.constants';
import type { CategoryStatus } from '../types/category';

export interface StatusBadgeProps {
  status: CategoryStatus;
}

/** Display-only — covers both real `CategoryStatus` values. */
export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={STATUS_BADGE_VARIANT[status]}>{STATUS_LABELS[status]}</Badge>;
}
