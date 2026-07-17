'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useFilteredNavigation } from '@/hooks/use-filtered-navigation';
import { useUiStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

/** Sidebar renderer — docs/60_ADMIN_NAVIGATION.md "Sidebar Structure" /
 * "Architecture". Renders exclusively from the permission-filtered
 * navigation manifest — no hand-duplicated menu list. */
export function Sidebar() {
  const groups = useFilteredNavigation();
  const pathname = usePathname();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <aside
      className={cn(
        'hidden h-screen shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 md:flex',
        collapsed ? 'w-16' : 'w-64'
      )}
      aria-label="Primary navigation"
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-3">
        {!collapsed ? (
          <span className="truncate text-sm font-semibold">Modern CMS Admin</span>
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronsRight className="size-4" aria-hidden="true" />
          ) : (
            <ChevronsLeft className="size-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {groups.map((group) => (
          <div key={group.id} className="space-y-1">
            {group.label && !collapsed ? (
              <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
            ) : null}
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {Icon ? <Icon className="size-4 shrink-0" aria-hidden="true" /> : null}
                  {!collapsed ? <span className="truncate">{item.label}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
