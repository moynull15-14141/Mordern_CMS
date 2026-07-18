'use client';

import { MoreHorizontal } from 'lucide-react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import type { PaginationMeta } from '@/types/api';
import { UserAvatar } from './user-avatar';
import { StatusBadge } from './status-badge';
import type { User } from '../types/user';

export interface UserTableProps {
  data: User[];
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  pagination?: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  search: string;
  onSearchChange: (value: string) => void;
  filters?: React.ReactNode;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onRestore: (user: User) => void;
}

/**
 * Users List — docs/56_ADMIN_FRONTEND_ARCHITECTURE.md "Table System",
 * built on the shared `DataTable` (server-driven pagination/sorting/search,
 * no client-side re-sort/re-filter). No row-selection/bulk actions
 * (approved decision 8 — no bulk backend endpoint exists for Users). No
 * role column (`UserResponseDto` has no `roles` field — see
 * docs/63_FRONTEND_USERS.md).
 */
export function UserTable({
  data,
  isLoading,
  error,
  onRetry,
  pagination,
  onPageChange,
  onLimitChange,
  sorting,
  onSortingChange,
  search,
  onSearchChange,
  filters,
  onView,
  onEdit,
  onDelete,
  onRestore,
}: UserTableProps) {
  const columns: ColumnDef<User, unknown>[] = [
    {
      id: 'name',
      accessorFn: (row) => row.displayName ?? row.username ?? row.email,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <UserAvatar displayName={row.original.displayName} email={row.original.email} />
          <span className="font-medium">
            {row.original.displayName ?? row.original.username ?? '—'}
          </span>
        </div>
      ),
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: 'updatedAt',
      accessorKey: 'updatedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
      cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${user.displayName ?? user.email}`}>
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onView(user)}>View</DropdownMenuItem>
              {user.deletedAt ? (
                <DropdownMenuItem onSelect={() => onRestore(user)}>Restore</DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onSelect={() => onEdit(user)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onDelete(user)} className="text-destructive">
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      emptyTitle="No users yet"
      emptyDescription="Create your first user to get started."
      pagination={pagination}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by email, username, or name…"
      filters={filters}
      getRowId={(row) => row.id}
    />
  );
}
