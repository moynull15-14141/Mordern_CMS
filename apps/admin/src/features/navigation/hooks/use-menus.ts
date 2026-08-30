'use client';

import { useQuery } from '@tanstack/react-query';
import { menusApi } from '../services/menus.api';
import { menusKeys } from './query-keys';
import type { MenuFilters } from '../types/menu';

/** `GET /menus` — server-driven pagination/filter/sort/search. */
export function useMenus(filters: MenuFilters) {
  return useQuery({
    queryKey: menusKeys.list(filters),
    queryFn: () => menusApi.list(filters),
  });
}

/** `GET /menus/:id` — full shape, including the nested item tree. */
export function useMenu(id: string) {
  return useQuery({
    queryKey: menusKeys.detail(id),
    queryFn: () => menusApi.get(id),
    enabled: Boolean(id),
  });
}

/** Every menu, unpaginated — powers the Header/Footer "pick a menu by
 * name" field in Site Design. A site realistically has a handful of
 * menus, so one `limit: 100` call is simpler and cheaper than adding a
 * dedicated search endpoint the backend doesn't have. */
export function useAllMenus() {
  return useQuery({
    queryKey: menusKeys.list({ limit: 100 }),
    queryFn: () => menusApi.list({ limit: 100 }),
  });
}
