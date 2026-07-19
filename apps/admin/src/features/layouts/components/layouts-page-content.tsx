'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/guards/permission-gate';
import { PERMISSIONS } from '@/constants/permissions';
import { LAYOUT_ROUTES } from '@/constants/routes';
import { useLayouts } from '../hooks/use-layouts';
import { useDeleteLayout } from '../hooks/use-delete-layout';
import { useRestoreLayout } from '../hooks/use-restore-layout';
import { LayoutTable } from './layout-table';
import { LayoutFilters, type LayoutFiltersValue } from './layout-filters';
import { DeleteDialog } from './delete-dialog';
import { RestoreDialog } from './restore-dialog';
import { AssignLayoutDialog } from './assign-layout-dialog';
import { LAYOUTS_DEFAULT_PAGE_SIZE } from '../constants/layout.constants';
import type { Layout, LayoutSortField } from '../types/layout';

/** Layouts List — page/sort/filter/search state lives in the URL, matching
 * `ThemesPageContent`'s established convention. No row-selection/bulk
 * actions — no bulk endpoint exists on `LayoutsController`. */
export function LayoutsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? String(LAYOUTS_DEFAULT_PAGE_SIZE));
  const search = searchParams.get('search') ?? '';
  const sortBy = (searchParams.get('sortBy') as LayoutSortField | null) ?? undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc' | null) ?? undefined;
  const status = (searchParams.get('status') as LayoutFiltersValue['status']) ?? undefined;

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

  const { data, isLoading, error, refetch } = useLayouts({
    page,
    limit,
    search: search || undefined,
    sortBy,
    sortOrder,
    status,
  });

  const deleteMutation = useDeleteLayout();
  const restoreMutation = useRestoreLayout();

  const [layoutToDelete, setLayoutToDelete] = useState<Layout | null>(null);
  const [layoutToRestore, setLayoutToRestore] = useState<Layout | null>(null);
  const [layoutToAssign, setLayoutToAssign] = useState<Layout | null>(null);

  const sorting: SortingState = useMemo(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []),
    [sortBy, sortOrder]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Layouts"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(LAYOUT_ROUTES.assignments())}>
              Assignments
            </Button>
            <PermissionGate permissions={PERMISSIONS.LAYOUT_MANAGE}>
              <Button onClick={() => router.push(LAYOUT_ROUTES.new())}>New layout</Button>
            </PermissionGate>
          </div>
        }
      />

      <LayoutTable
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
          <LayoutFilters
            value={{ status }}
            onChange={(next) => updateParams({ status: next.status, page: '1' })}
          />
        }
        onView={(layout) => router.push(LAYOUT_ROUTES.detail(layout.id))}
        onEdit={(layout) => router.push(LAYOUT_ROUTES.edit(layout.id))}
        onDelete={setLayoutToDelete}
        onRestore={setLayoutToRestore}
        onAssign={setLayoutToAssign}
      />

      <DeleteDialog
        open={Boolean(layoutToDelete)}
        onOpenChange={(open) => !open && setLayoutToDelete(null)}
        layoutName={layoutToDelete?.name ?? ''}
        onConfirm={() => {
          if (layoutToDelete) deleteMutation.mutate(layoutToDelete.id);
        }}
      />
      <RestoreDialog
        open={Boolean(layoutToRestore)}
        onOpenChange={(open) => !open && setLayoutToRestore(null)}
        layoutName={layoutToRestore?.name ?? ''}
        onConfirm={() => {
          if (layoutToRestore) restoreMutation.mutate(layoutToRestore.id);
        }}
      />
      <AssignLayoutDialog
        open={Boolean(layoutToAssign)}
        onOpenChange={(open) => !open && setLayoutToAssign(null)}
        layoutId={layoutToAssign?.id}
      />
    </div>
  );
}
