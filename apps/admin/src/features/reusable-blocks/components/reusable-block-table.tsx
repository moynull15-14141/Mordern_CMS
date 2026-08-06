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
import { getBlockDefinition } from '@/features/block-editor';
import type { PaginationMeta } from '@/types/api';
import { ReusableBlockPreview } from './reusable-block-preview';
import type { ReusableBlock } from '../types/reusable-block';

export interface ReusableBlockTableProps {
  data: ReusableBlock[];
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
  onView: (block: ReusableBlock) => void;
  onEdit: (block: ReusableBlock) => void;
  onDuplicate: (block: ReusableBlock) => void;
  onDelete: (block: ReusableBlock) => void;
  onRestore: (block: ReusableBlock) => void;
}

/** Reusable Blocks List — built on the shared `DataTable` (server-driven
 * pagination/sorting/search, matching `ReusableBlockQueryDto`). No bulk
 * selection column — no bulk endpoint exists on `ReusableBlocksController`. */
export function ReusableBlockTable({
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
  onDuplicate,
  onDelete,
  onRestore,
}: ReusableBlockTableProps) {
  const columns: ColumnDef<ReusableBlock, unknown>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.name}</div>
          <ReusableBlockPreview block={row.original} />
        </div>
      ),
    },
    {
      id: 'blockType',
      accessorKey: 'blockType',
      header: 'Type',
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant="outline">
          {getBlockDefinition(row.original.blockType)?.label ?? row.original.blockType}
        </Badge>
      ),
    },
    {
      id: 'category',
      accessorKey: 'category',
      header: 'Category',
      enableSorting: false,
      cell: ({ row }) => row.original.category ?? <span className="text-muted-foreground">—</span>,
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
        const block = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${block.name}`}>
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onView(block)}>View</DropdownMenuItem>
              {block.deletedAt ? (
                <DropdownMenuItem onSelect={() => onRestore(block)}>Restore</DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onSelect={() => onEdit(block)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onDuplicate(block)}>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onDelete(block)} className="text-destructive">
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
      emptyTitle="No reusable blocks yet"
      emptyDescription="Save a block from the editor, or create one here, to build your library."
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
