'use client';

import { useMemo } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { NAVIGATION } from '@/config/navigation';
import type { NavGroup, NavItem } from '@/types/navigation';

/**
 * Menu Guard — docs/60_ADMIN_NAVIGATION.md "Menu Guard": an item whose
 * permission requirement isn't met is NOT rendered (filtered out here, not
 * disabled in the DOM). A group with zero visible children also doesn't
 * render.
 */
export function useFilteredNavigation(): NavGroup[] {
  const { canAny } = usePermissions();

  return useMemo(() => {
    function isVisible(item: NavItem): boolean {
      if (!item.permissions || item.permissions.length === 0) return true;
      return canAny(item.permissions);
    }

    return NAVIGATION.map((group) => ({
      ...group,
      items: group.items
        .filter(isVisible)
        .map((item) =>
          item.children ? { ...item, children: item.children.filter(isVisible) } : item
        ),
    })).filter((group) => group.items.length > 0);
  }, [canAny]);
}
