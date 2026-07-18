'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/guards/permission-gate';
import { PERMISSIONS } from '@/constants/permissions';
import { PAGE_ROUTES } from '@/constants/routes';
import { usePages } from '../hooks/use-pages';
import { useDeletePage } from '../hooks/use-delete-page';
import { useRestorePage } from '../hooks/use-restore-page';
import { PageTable } from './page-table';
import { PageFilters, type PageFiltersValue } from './page-filters';
import { DeleteDialog } from './delete-dialog';
import { RestoreDialog } from './restore-dialog';
import { PAGES_DEFAULT_PAGE_SIZE } from '../constants/page.constants';
import type { Page, PageSortField } from '../types/page';

/** Pages List — page/sort/filter/search state lives in the URL, matching
 * `ArticlesPageContent`'s established convention. No row-selection/bulk
 * actions — no bulk endpoint exists on `PagesController`. */
export function PagesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? String(PAGES_DEFAULT_PAGE_SIZE));
  const search = searchParams.get('search') ?? '';
  const sortBy = (searchParams.get('sortBy') as PageSortField | null) ?? undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc' | null) ?? undefined;
  const status = (searchParams.get('status') as PageFiltersValue['status']) ?? undefined;

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

  const { data, isLoading, error, refetch } = usePages({
    page,
    limit,
    search: search || undefined,
    sortBy,
    sortOrder,
    status,
  });

  const deleteMutation = useDeletePage();
  const restoreMutation = useRestorePage();

  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
  const [pageToRestore, setPageToRestore] = useState<Page | null>(null);

  const sorting: SortingState = useMemo(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []),
    [sortBy, sortOrder]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pages"
        actions={
          <PermissionGate permissions={PERMISSIONS.PAGE_MANAGE}>
            <Button onClick={() => router.push(PAGE_ROUTES.new())}>New page</Button>
          </PermissionGate>
        }
      />

      <PageTable
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
          <PageFilters
            value={{ status }}
            onChange={(next) => updateParams({ status: next.status, page: '1' })}
          />
        }
        onView={(pageRow) => router.push(PAGE_ROUTES.detail(pageRow.id))}
        onEdit={(pageRow) => router.push(PAGE_ROUTES.edit(pageRow.id))}
        onDelete={setPageToDelete}
        onRestore={setPageToRestore}
      />

      <DeleteDialog
        open={Boolean(pageToDelete)}
        onOpenChange={(open) => !open && setPageToDelete(null)}
        pageTitle={pageToDelete?.title ?? ''}
        onConfirm={() => {
          if (pageToDelete) deleteMutation.mutate(pageToDelete.id);
        }}
      />
      <RestoreDialog
        open={Boolean(pageToRestore)}
        onOpenChange={(open) => !open && setPageToRestore(null)}
        pageTitle={pageToRestore?.title ?? ''}
        onConfirm={() => {
          if (pageToRestore) restoreMutation.mutate(pageToRestore.id);
        }}
      />
    </div>
  );
}
