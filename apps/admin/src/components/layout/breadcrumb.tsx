'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { flattenNavigation } from '@/config/navigation';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

/** Breadcrumb renderer — docs/60_ADMIN_NAVIGATION.md "Breadcrumbs": "Derived
 * from the same navigation manifest plus the current route's dynamic
 * segments." Leaf-segment labels beyond the matched nav item are rendered
 * as raw path segments (a future page can override via a page-level
 * breadcrumb override, not built in this foundation). */
export function Breadcrumb() {
  const pathname = usePathname();
  const flatItems = flattenNavigation();

  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    const match = flatItems.find((item) => item.href === href);
    return { href, label: match?.label ?? decodeURIComponent(segment) };
  });

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link href={ROUTES.DASHBOARD} className="hover:text-foreground">
        Dashboard
      </Link>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={crumb.href} className="flex items-center gap-1">
            <ChevronRight className="size-3.5" aria-hidden="true" />
            {isLast ? (
              <span aria-current="page" className={cn('font-medium text-foreground')}>
                {crumb.label}
              </span>
            ) : (
              <Link href={crumb.href} className="hover:text-foreground">
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
