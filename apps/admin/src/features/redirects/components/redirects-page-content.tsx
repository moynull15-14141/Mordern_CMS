'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/guards/permission-gate';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { PERMISSIONS } from '@/constants/permissions';
import { REDIRECT_ROUTES } from '@/constants/routes';
import { useRedirects } from '../hooks/use-redirects';
import { useDeleteRedirect } from '../hooks/use-redirect-mutations';
import { RedirectTable } from './redirect-table';
import type { Redirect, RedirectSortField } from '../types/redirect';

const DEFAULT_PAGE_SIZE = 20;

export function RedirectsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? String(DEFAULT_PAGE_SIZE));
  const search = searchParams.get('search') ?? '';
  const sortBy = (searchParams.get('sortBy') as RedirectSortField | null) ?? undefined;
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

  const listQuery = useRedirects({ page, limit, search: search || undefined, sortBy, sortOrder });
  const deleteMutation = useDeleteRedirect();

  const [redirectToDelete, setRedirectToDelete] = useState<Redirect | null>(null);

  const listItems = useMemo(() => listQuery.data?.data ?? [], [listQuery.data]);
  const sorting: SortingState = useMemo(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []),
    [sortBy, sortOrder]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Redirects"
        description="Send visitors from an old address to the right page automatically."
        actions={
          <PermissionGate permissions={PERMISSIONS.PAGE_MANAGE}>
            <Button onClick={() => router.push(REDIRECT_ROUTES.new())}>New redirect</Button>
          </PermissionGate>
        }
      />

      <RedirectTable
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
        onEdit={(redirect) => router.push(REDIRECT_ROUTES.edit(redirect.id))}
        onDelete={setRedirectToDelete}
      />

      <ConfirmDialog
        open={Boolean(redirectToDelete)}
        onOpenChange={(open) => !open && setRedirectToDelete(null)}
        title="Delete redirect"
        description={`Stop redirecting "${redirectToDelete?.sourcePath}"? Visitors to that address will see a normal 404 again.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (redirectToDelete) deleteMutation.mutate(redirectToDelete.id);
        }}
      />
    </div>
  );
}
