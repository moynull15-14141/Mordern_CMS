'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/guards/permission-gate';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { PERMISSIONS } from '@/constants/permissions';
import { NAVIGATION_ROUTES } from '@/constants/routes';
import { useActiveTheme } from '@/features/themes';
import { useMenus } from '../hooks/use-menus';
import { useDeleteMenu } from '../hooks/use-menu-mutations';
import { MenuTable } from './menu-table';
import { NAVIGATION_DEFAULT_PAGE_SIZE } from '../constants/menu.constants';
import type { Menu, MenuSortField } from '../types/menu';

/** Which of the active theme's assignable slots reference this menu id
 * — used to warn before deleting an in-use menu instead of silently
 * breaking the live site's header/footer (spec "Delete Safety"). */
function assignedLocations(menuId: string, headerMenuId?: string, footerMenuId?: string): string[] {
  const found: string[] = [];
  if (headerMenuId === menuId) found.push('Header');
  if (footerMenuId === menuId) found.push('Footer');
  return found;
}

export function NavigationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeThemeQuery = useActiveTheme();

  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? String(NAVIGATION_DEFAULT_PAGE_SIZE));
  const search = searchParams.get('search') ?? '';
  const sortBy = (searchParams.get('sortBy') as MenuSortField | null) ?? undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc' | null) ?? undefined;

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      router.push(`?${next.toString()}`);
    },
    [router, searchParams]
  );

  const listQuery = useMenus({ page, limit, search: search || undefined, sortBy, sortOrder });
  const deleteMutation = useDeleteMenu();

  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null);

  const listItems = useMemo(() => listQuery.data?.data ?? [], [listQuery.data]);
  const sorting: SortingState = useMemo(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []),
    [sortBy, sortOrder]
  );

  const headerMenuId = activeThemeQuery.data?.settings?.designTokens?.header?.menuId;
  const footerMenuId = activeThemeQuery.data?.settings?.designTokens?.footer?.menuId;
  const deleteWarningLocations = menuToDelete
    ? assignedLocations(menuToDelete.id, headerMenuId, footerMenuId)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Navigation"
        description="Manage the menus that power your site's header and footer."
        actions={
          <PermissionGate permissions={PERMISSIONS.MENU_MANAGE}>
            <Button onClick={() => router.push(NAVIGATION_ROUTES.new())}>New navigation</Button>
          </PermissionGate>
        }
      />

      <MenuTable
        data={listItems}
        isLoading={listQuery.isLoading}
        error={listQuery.error}
        onRetry={() => listQuery.refetch()}
        pagination={listQuery.data?.meta.pagination}
        onPageChange={(next) => updateParams({ page: String(next) })}
        onLimitChange={(next) => updateParams({ limit: String(next), page: '1' })}
        sorting={sorting}
        onSortingChange={(next) => {
          const first = next[0];
          updateParams({
            sortBy: first?.id,
            sortOrder: first ? (first.desc ? 'desc' : 'asc') : undefined,
          });
        }}
        search={search}
        onSearchChange={(next) => updateParams({ search: next, page: '1' })}
        onEdit={(menu) => router.push(NAVIGATION_ROUTES.edit(menu.id))}
        onDelete={setMenuToDelete}
      />

      <ConfirmDialog
        open={Boolean(menuToDelete)}
        onOpenChange={(open) => !open && setMenuToDelete(null)}
        title="Delete navigation"
        description={
          deleteWarningLocations.length > 0
            ? `This navigation is currently used by your ${deleteWarningLocations.join(' and ')}. Remove the assignment in Site Design before deleting, or your site's ${deleteWarningLocations.join('/').toLowerCase()} will lose its menu.`
            : `Delete "${menuToDelete?.name}"? Pages using this menu in their header or footer will show no navigation until a new one is assigned.`
        }
        confirmLabel={deleteWarningLocations.length > 0 ? 'Delete anyway' : 'Delete'}
        variant="destructive"
        onConfirm={() => {
          if (menuToDelete) deleteMutation.mutate(menuToDelete.id);
        }}
      />
    </div>
  );
}
