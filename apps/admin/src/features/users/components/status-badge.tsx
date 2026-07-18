import { Badge } from '@/components/ui/badge';
import { USER_STATUS_BADGE_VARIANT, USER_STATUS_LABELS } from '../constants/user.constants';
import type { UserStatus } from '../types/user';

export interface StatusBadgeProps {
  status: UserStatus;
}

/** Display-only — docs/57_DESIGN_SYSTEM.md "Status Colors". No status is
 * editable from this component; there is no `activate`/`deactivate`
 * endpoint wired in this milestone (see docs/63_FRONTEND_USERS.md). */
export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={USER_STATUS_BADGE_VARIANT[status]}>{USER_STATUS_LABELS[status]}</Badge>;
}
