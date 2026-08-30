'use client';

import { MoreHorizontal } from 'lucide-react';
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
import { countItems } from '../utils/menu-item-tree.util';
import { MENU_STATUS_LABEL } from '../constants/menu.constants';
import type { Menu } from '../types/menu';

export interface MenuTableProps {
  data: Menu[];
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
  filters?: React.ReactNode;
  onEdit: (menu: Menu) => void;
  onDelete: (menu: Menu) => void;
}

export function MenuTable({
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
  onEdit,
  onDelete,
}: MenuTableProps) {
  const columns: ColumnDef<Menu, unknown>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      id: 'location',
      accessorKey: 'location',
      header: 'Location',
      enableSorting: false,
      cell: ({ row }) =>
        row.original.location ? (
          <Badge variant="secondary">{row.original.location}</Badge>
        ) : (
          <span className="text-muted-foreground">Not assigned</span>
        ),
    },
    {
      id: 'itemCount',
      header: 'Items',
      enableSorting: false,
      cell: ({ row }) => countItems(row.original.items ?? []),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'PUBLISHED' ? 'success' : 'outline'}>
          {MENU_STATUS_LABEL[row.original.status]}
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
        const menu = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${menu.name}`}>
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(menu)}>Open</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onDelete(menu)} className="text-destructive">
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
      emptyTitle="No navigation menus yet"
      emptyDescription="Create your first navigation menu to build your site's header or footer links."
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
