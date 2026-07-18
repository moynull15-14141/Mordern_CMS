'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/guards/permission-gate';
import { PERMISSIONS } from '@/constants/permissions';
import { THEME_ROUTES } from '@/constants/routes';
import { useThemes } from '../hooks/use-themes';
import { useDeleteTheme } from '../hooks/use-delete-theme';
import { useRestoreTheme } from '../hooks/use-restore-theme';
import { useActivateTheme } from '../hooks/use-activate-theme';
import { ThemeTable } from './theme-table';
import { ThemeFilters, type ThemeFiltersValue } from './theme-filters';
import { DeleteDialog } from './delete-dialog';
import { RestoreDialog } from './restore-dialog';
import { ActivateDialog } from './activate-dialog';
import { THEMES_DEFAULT_PAGE_SIZE } from '../constants/theme.constants';
import type { Theme, ThemeSortField } from '../types/theme';

/** Themes List — page/sort/filter/search state lives in the URL, matching
 * `PagesPageContent`'s established convention. No row-selection/bulk
 * actions — no bulk endpoint exists on `ThemesController`. */
export function ThemesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? String(THEMES_DEFAULT_PAGE_SIZE));
  const search = searchParams.get('search') ?? '';
  const sortBy = (searchParams.get('sortBy') as ThemeSortField | null) ?? undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc' | null) ?? undefined;
  const status = (searchParams.get('status') as ThemeFiltersValue['status']) ?? undefined;

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

  const { data, isLoading, error, refetch } = useThemes({
    page,
    limit,
    search: search || undefined,
    sortBy,
    sortOrder,
    status,
  });

  const deleteMutation = useDeleteTheme();
  const restoreMutation = useRestoreTheme();
  const activateMutation = useActivateTheme();

  const [themeToDelete, setThemeToDelete] = useState<Theme | null>(null);
  const [themeToRestore, setThemeToRestore] = useState<Theme | null>(null);
  const [themeToActivate, setThemeToActivate] = useState<Theme | null>(null);

  const sorting: SortingState = useMemo(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []),
    [sortBy, sortOrder]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Themes"
        actions={
          <PermissionGate permissions={PERMISSIONS.THEME_MANAGE}>
            <Button onClick={() => router.push(THEME_ROUTES.new())}>New theme</Button>
          </PermissionGate>
        }
      />

      <ThemeTable
        data={data?.data ?? []}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        pagination={data?.meta.pagination}
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
        filters={
          <ThemeFilters
            value={{ status }}
            onChange={(next) => updateParams({ status: next.status, page: '1' })}
          />
        }
        onView={(theme) => router.push(THEME_ROUTES.detail(theme.id))}
        onEdit={(theme) => router.push(THEME_ROUTES.edit(theme.id))}
        onDelete={setThemeToDelete}
        onRestore={setThemeToRestore}
        onActivate={setThemeToActivate}
      />

      <DeleteDialog
        open={Boolean(themeToDelete)}
        onOpenChange={(open) => !open && setThemeToDelete(null)}
        themeName={themeToDelete?.name ?? ''}
        onConfirm={() => {
          if (themeToDelete) deleteMutation.mutate(themeToDelete.id);
        }}
      />
      <RestoreDialog
        open={Boolean(themeToRestore)}
        onOpenChange={(open) => !open && setThemeToRestore(null)}
        themeName={themeToRestore?.name ?? ''}
        onConfirm={() => {
          if (themeToRestore) restoreMutation.mutate(themeToRestore.id);
        }}
      />
      <ActivateDialog
        open={Boolean(themeToActivate)}
        onOpenChange={(open) => !open && setThemeToActivate(null)}
        themeName={themeToActivate?.name ?? ''}
        onConfirm={() => {
          if (themeToActivate) activateMutation.mutate(themeToActivate.id);
        }}
      />
    </div>
  );
}
