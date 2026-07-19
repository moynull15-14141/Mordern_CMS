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
import { PRESET_LABELS } from '../constants/layout.constants';
import type { Layout, LayoutPresetName } from '../types/layout';

export interface LayoutTableProps {
  data: Layout[];
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
  onView: (layout: Layout) => void;
  onEdit: (layout: Layout) => void;
  onDelete: (layout: Layout) => void;
  onRestore: (layout: Layout) => void;
  onAssign: (layout: Layout) => void;
}

/** Layouts List — built on the shared `DataTable` (server-driven
 * pagination/sorting/search/filter, matching `LayoutQueryDto` exactly). No
 * bulk selection column — no bulk endpoint exists on `LayoutsController`. */
export function LayoutTable({
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
  onAssign,
}: LayoutTableProps) {
  const columns: ColumnDef<Layout, unknown>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="font-mono text-xs text-muted-foreground">{row.original.slug}</div>
        </div>
      ),
    },
    {
      id: 'layoutPreset',
      accessorKey: 'layoutPreset',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Preset" />,
      enableSorting: false,
      cell: ({ row }) =>
        PRESET_LABELS[row.original.layoutPreset as LayoutPresetName] ?? row.original.layoutPreset,
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
        const layout = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${layout.name}`}>
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onView(layout)}>View</DropdownMenuItem>
              {layout.deletedAt ? (
                <DropdownMenuItem onSelect={() => onRestore(layout)}>Restore</DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onSelect={() => onEdit(layout)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onAssign(layout)}>Assign to…</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onDelete(layout)} className="text-destructive">
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
      emptyTitle="No layouts yet"
      emptyDescription="Create your first layout to get started."
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
