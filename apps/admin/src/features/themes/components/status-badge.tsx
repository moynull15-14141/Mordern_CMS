import { Badge } from '@/components/ui/badge';
import { STATUS_BADGE_VARIANT, STATUS_LABELS } from '../constants/theme.constants';
import type { ThemeStatus } from '../types/theme';

export interface StatusBadgeProps {
  status: ThemeStatus;
}

/** Display-only — covers all 3 real `ThemeStatus` values. */
export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={STATUS_BADGE_VARIANT[status]}>{STATUS_LABELS[status]}</Badge>;
}
