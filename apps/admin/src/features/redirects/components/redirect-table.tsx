'use client';

import { MoreHorizontal, ArrowRight } from 'lucide-react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import type { PaginationMeta } from '@/types/api';
import type { Redirect } from '../types/redirect';

export interface RedirectTableProps {
  data: Redirect[];
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  onEdit: (redirect: Redirect) => void;
  onDelete: (redirect: Redirect) => void;
}

export function RedirectTable({
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
  onEdit,
  onDelete,
}: RedirectTableProps) {
  const columns: ColumnDef<Redirect, unknown>[] = [
    {
      id: 'sourcePath',
      accessorKey: 'sourcePath',
      header: ({ column }) => <DataTableColumnHeader column={column} title="From" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-mono text-sm">
          <span>{row.original.sourcePath}</span>
          <ArrowRight className="size-3 text-muted-foreground" aria-hidden="true" />
          <span className="text-muted-foreground">{row.original.destinationUrl}</span>
        </div>
      ),
    },
    {
      id: 'redirectType',
      accessorKey: 'redirectType',
      header: 'Type',
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.redirectType} —{' '}
          {row.original.redirectType === 301 ? 'Permanent' : 'Temporary'}
        </Badge>
      ),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'ACTIVE' ? 'success' : 'outline'}>
          {row.original.status === 'ACTIVE' ? 'Active' : 'Disabled'}
        </Badge>
      ),
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
        const redirect = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${redirect.sourcePath}`}>
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(redirect)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onDelete(redirect)} className="text-destructive">
                Delete
              </DropdownMenuItem>
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
      emptyTitle="No redirects yet"
      emptyDescription="Create one when an old page's address changes, so visitors and search engines land in the right place."
      pagination={pagination}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by path…"
      getRowId={(row) => row.id}
    />
  );
}
