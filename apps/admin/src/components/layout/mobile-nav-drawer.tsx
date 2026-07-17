'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useFilteredNavigation } from '@/hooks/use-filtered-navigation';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/utils/cn';

/** Responsive Drawer — docs/56_ADMIN_FRONTEND_ARCHITECTURE.md "Layout
 * System — Drawer Layout" / docs/57_DESIGN_SYSTEM.md "Responsive Strategy"
 * (Sidebar becomes a drawer/sheet below the tablet breakpoint). */
export function MobileNavDrawer() {
  const groups = useFilteredNavigation();
  const pathname = usePathname();
  const open = useUiStore((state) => state.mobileDrawerOpen);
  const setOpen = useUiStore((state) => state.setMobileDrawerOpen);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent side="left" className="w-72">
        <DrawerHeader>
          <DrawerTitle>Navigation</DrawerTitle>
        </DrawerHeader>
        <nav className="flex-1 space-y-4 overflow-y-auto">
          {groups.map((group) => (
            <div key={group.id} className="space-y-1">
              {group.label ? (
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
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    {Icon ? <Icon className="size-4 shrink-0" aria-hidden="true" /> : null}
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </DrawerContent>
    </Drawer>
  );
}
