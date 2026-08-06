import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { PAGE_ROUTES, ARTICLE_ROUTES } from '@/constants/routes';
import { CONTENT_TYPE_LABELS } from '../constants/reusable-block.constants';
import type { ReusableBlockUsageReference } from '../types/reusable-block';

export interface UsageListProps {
  usages: ReusableBlockUsageReference[];
}

function editRouteFor(usage: ReusableBlockUsageReference): string {
  return usage.contentType === 'page' ? PAGE_ROUTES.edit(usage.id) : ARTICLE_ROUTES.edit(usage.id);
}

/** Every Page/Article referencing a reusable block, each linking straight
 * to its edit page — the spec's "allow navigation to those items." */
export function UsageList({ usages }: UsageListProps) {
  return (
    <ul className="space-y-2">
      {usages.map((usage) => (
        <li key={`${usage.contentType}-${usage.id}`}>
          <Link
            href={editRouteFor(usage)}
            className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent"
          >
            <Badge variant="outline">{CONTENT_TYPE_LABELS[usage.contentType]}</Badge>
            <span className="truncate">{usage.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
