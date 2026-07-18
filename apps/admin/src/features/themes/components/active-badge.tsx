import { Badge } from '@/components/ui/badge';

/** Display-only — the `isActive` flag, separate from `StatusBadge`
 * (`status` and `isActive` are independent fields on `Theme`). */
export function ActiveBadge({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;
  return <Badge variant="success">Active</Badge>;
}
