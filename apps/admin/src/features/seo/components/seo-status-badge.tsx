import { Badge } from '@/components/ui/badge';
import { SEO_STATUS_LABEL, type SeoStatus } from '../lib/seo-score';

const STATUS_VARIANT = {
  excellent: 'success',
  good: 'info',
  'needs-improvement': 'warning',
  poor: 'destructive',
} as const;

export function SeoStatusBadge({ status }: { status: SeoStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{SEO_STATUS_LABEL[status]}</Badge>;
}
