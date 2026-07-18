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
import { MediaThumbnail } from './media-thumbnail';
import { StatusBadge } from './status-badge';
import { TYPE_LABELS } from '../constants/media.constants';
import { formatFileSize } from '../utils/format-filesize';
import type { Media } from '../types/media';

export interface MediaTableProps {
  data: Media[];
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
  onView: (media: Media) => void;
  onDelete: (media: Media) => void;
  onRestore: (media: Media) => void;
}

/** Media List — List View. Built on the shared `DataTable` (server
 * pagination/search/sort/filter, matching `MediaQueryDto` exactly). No
 * bulk selection — no bulk endpoint exists. No Edit row action — metadata
 * editing happens inline on the Detail page (no separate edit route). */
export function MediaTable({
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
  onDelete,
  onRestore,
}: MediaTableProps) {
  const columns: ColumnDef<Media, unknown>[] = [
    {
      id: 'filename',
      accessorKey: 'filename',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Filename" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <MediaThumbnail type={row.original.type} className="size-9 shrink-0" />
          <div>
            <div className="font-medium">{row.original.filename}</div>
            <div className="text-xs text-muted-foreground">{TYPE_LABELS[row.original.type]}</div>
          </div>
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
      id: 'filesize',
      accessorKey: 'filesize',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Size" />,
      cell: ({ row }) => formatFileSize(row.original.filesize),
    },
    {
      id: 'dimensions',
      header: 'Dimensions',
      enableSorting: false,
      cell: ({ row }) =>
        row.original.width && row.original.height ? `${row.original.width}×${row.original.height}` : '—',
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Uploaded" />,
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const media = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${media.filename}`}>
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onView(media)}>View</DropdownMenuItem>
              {media.deletedAt ? (
                <DropdownMenuItem onSelect={() => onRestore(media)}>Restore</DropdownMenuItem>
              ) : (
                <DropdownMenuItem onSelect={() => onDelete(media)} className="text-destructive">
                  Delete
                </DropdownMenuItem>
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
      emptyTitle="No media yet"
      emptyDescription="Register your first media asset to get started."
      pagination={pagination}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by filename, alt text, or caption…"
      filters={filters}
      getRowId={(row) => row.id}
    />
  );
}
