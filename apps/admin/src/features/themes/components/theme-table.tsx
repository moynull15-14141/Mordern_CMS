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
import { StatusBadge } from './status-badge';
import { ActiveBadge } from './active-badge';
import type { Theme } from '../types/theme';

export interface ThemeTableProps {
  data: Theme[];
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
  onView: (theme: Theme) => void;
  onEdit: (theme: Theme) => void;
  onDelete: (theme: Theme) => void;
  onRestore: (theme: Theme) => void;
  onActivate: (theme: Theme) => void;
}

/** Themes List — built on the shared `DataTable` (server-driven
 * pagination/sorting/search/filter, matching `ThemeQueryDto` exactly). No
 * bulk selection column — no bulk endpoint exists on `ThemesController`. */
export function ThemeTable({
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
  onActivate,
}: ThemeTableProps) {
  const columns: ColumnDef<Theme, unknown>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <div>
          <div className="flex items-center gap-2 font-medium">
            {row.original.name}
            <ActiveBadge isActive={row.original.isActive} />
          </div>
          <div className="font-mono text-xs text-muted-foreground">{row.original.slug}</div>
        </div>
      ),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
        const theme = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${theme.name}`}>
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onView(theme)}>View</DropdownMenuItem>
              {theme.deletedAt ? (
                <DropdownMenuItem onSelect={() => onRestore(theme)}>Restore</DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onSelect={() => onEdit(theme)}>Edit</DropdownMenuItem>
                  {!theme.isActive ? (
                    <DropdownMenuItem onSelect={() => onActivate(theme)}>Activate</DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem onSelect={() => onDelete(theme)} className="text-destructive">
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
      emptyTitle="No themes yet"
      emptyDescription="Create your first theme to get started."
      pagination={pagination}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by name…"
      filters={filters}
      getRowId={(row) => row.id}
    />
  );
}
