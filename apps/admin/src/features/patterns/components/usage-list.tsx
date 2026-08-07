import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { PAGE_ROUTES, ARTICLE_ROUTES, REUSABLE_BLOCK_ROUTES } from '@/constants/routes';
import { CONTENT_TYPE_LABELS } from '../constants/pattern.constants';
import type { PatternUsageReference } from '../types/pattern';

export interface UsageListProps {
  usages: PatternUsageReference[];
}

function editRouteFor(usage: PatternUsageReference): string {
  if (usage.contentType === 'page') return PAGE_ROUTES.edit(usage.id);
  if (usage.contentType === 'article') return ARTICLE_ROUTES.edit(usage.id);
  return REUSABLE_BLOCK_ROUTES.edit(usage.id);
}

/** Every Page/Article/Reusable Block that has ever inserted this pattern —
 * "Inserted From," never "Currently Linked." Insertion always clones the
 * block tree with fresh ids, so nothing here is a live reference: editing
 * the pattern does not change any of these, and editing/removing the
 * inserted blocks in any of these naturally drops it from this list (the
 * `meta.patternOrigin` marker goes with the blocks it was stamped on). */
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
