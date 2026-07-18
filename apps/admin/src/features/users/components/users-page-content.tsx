'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/guards/permission-gate';
import { PERMISSIONS } from '@/constants/permissions';
import { USER_ROUTES } from '@/constants/routes';
import { useUsers } from '../hooks/use-users';
import { useDeleteUser } from '../hooks/use-delete-user';
import { useRestoreUser } from '../hooks/use-restore-user';
import { UserTable } from './user-table';
import { UserFilters, type UserFiltersValue } from './user-filters';
import { DeleteDialog } from './delete-dialog';
import { RestoreDialog } from './restore-dialog';
import type { User, UserSortField } from '../types/user';
import { USERS_DEFAULT_PAGE_SIZE } from '../constants/user.constants';

/**
 * Users List — docs/56_ADMIN_FRONTEND_ARCHITECTURE.md "State Management":
 * page/sort/filter/search state lives in the URL (shareable/bookmarkable),
 * never Zustand. No row-selection/bulk actions (approved decision 8 — no
 * bulk backend endpoint exists).
 */
export function UsersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? String(USERS_DEFAULT_PAGE_SIZE));
  const search = searchParams.get('search') ?? '';
  const sortBy = (searchParams.get('sortBy') as UserSortField | null) ?? undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc' | null) ?? undefined;
  const status = (searchParams.get('status') as UserFiltersValue['status']) ?? undefined;
  const role = searchParams.get('role') ?? undefined;
  const createdFrom = searchParams.get('createdFrom') ?? undefined;
  const createdTo = searchParams.get('createdTo') ?? undefined;

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
    [router, searchParams],
  );

  const { data, isLoading, error, refetch } = useUsers({
    page,
    limit,
    search: search || undefined,
    sortBy,
    sortOrder,
    status,
    role,
    createdFrom,
    createdTo,
  });

  const deleteMutation = useDeleteUser();
  const restoreMutation = useRestoreUser();

  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToRestore, setUserToRestore] = useState<User | null>(null);

  const sorting: SortingState = useMemo(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []),
    [sortBy, sortOrder],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        actions={
          <PermissionGate permissions={PERMISSIONS.USERS_MANAGE}>
            <Button onClick={() => router.push(USER_ROUTES.new())}>New user</Button>
          </PermissionGate>
        }
      />

      <UserTable
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
          updateParams({ sortBy: first?.id, sortOrder: first ? (first.desc ? 'desc' : 'asc') : undefined });
        }}
        search={search}
        onSearchChange={(next) => updateParams({ search: next, page: '1' })}
        filters={
          <UserFilters
            value={{ status, role, createdFrom, createdTo }}
            onChange={(next) =>
              updateParams({
                status: next.status,
                role: next.role,
                createdFrom: next.createdFrom,
                createdTo: next.createdTo,
                page: '1',
              })
            }
          />
        }
        onView={(user) => router.push(USER_ROUTES.detail(user.id))}
        onEdit={(user) => router.push(USER_ROUTES.edit(user.id))}
        onDelete={setUserToDelete}
        onRestore={setUserToRestore}
      />

      <DeleteDialog
        open={Boolean(userToDelete)}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        userLabel={userToDelete?.displayName ?? userToDelete?.email ?? ''}
        onConfirm={() => {
          if (userToDelete) deleteMutation.mutate(userToDelete.id);
        }}
      />
      <RestoreDialog
        open={Boolean(userToRestore)}
        onOpenChange={(open) => !open && setUserToRestore(null)}
        userLabel={userToRestore?.displayName ?? userToRestore?.email ?? ''}
        onConfirm={() => {
          if (userToRestore) restoreMutation.mutate(userToRestore.id);
        }}
      />
    </div>
  );
}
