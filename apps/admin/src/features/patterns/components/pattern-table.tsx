'use client';

import { MoreHorizontal, Star } from 'lucide-react';
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
import { cn } from '@/utils/cn';
import type { PaginationMeta } from '@/types/api';
import type { PatternSummary } from '../types/pattern';

export interface PatternTableProps {
  data: PatternSummary[];
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
  favoriteIds: Set<string>;
  onToggleFavorite: (pattern: PatternSummary) => void;
  onView: (pattern: PatternSummary) => void;
  onEdit: (pattern: PatternSummary) => void;
  onDuplicate: (pattern: PatternSummary) => void;
  onArchive: (pattern: PatternSummary) => void;
  onUnarchive: (pattern: PatternSummary) => void;
  onDelete: (pattern: PatternSummary) => void;
  onRestore: (pattern: PatternSummary) => void;
}

/** The one Pattern Library table — used for the main paginated list and,
 * unpaginated, for the Favorites/Recently Used views (`pagination`/
 * `onPageChange` are optional for exactly that reason). No bulk-select —
 * the spec lists per-row actions only (Duplicate/Edit/Archive/Restore/
 * Delete), no bulk endpoint exists on `PatternsController`. */
export function PatternTable({
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
  favoriteIds,
  onToggleFavorite,
  onView,
  onEdit,
  onDuplicate,
  onArchive,
  onUnarchive,
  onDelete,
  onRestore,
}: PatternTableProps) {
  const columns: ColumnDef<PatternSummary, unknown>[] = [
    {
      id: 'favorite',
      header: () => <span className="sr-only">Favorite</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const isFavorite = favoriteIds.has(row.original.id);
        return (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isFavorite}
            onClick={() => onToggleFavorite(row.original)}
          >
            <Star className={cn('size-4', isFavorite && 'fill-current text-warning')} />
          </Button>
        );
      },
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.name}</div>
          {row.original.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {row.original.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
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
      id: 'blockCount',
      accessorKey: 'blockCount',
      header: 'Blocks',
      enableSorting: false,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'ARCHIVED' ? 'outline' : 'success'}>
          {row.original.status === 'ARCHIVED' ? 'Archived' : 'Active'}
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
        const pattern = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${pattern.name}`}>
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onView(pattern)}>View</DropdownMenuItem>
              {pattern.deletedAt ? (
                <DropdownMenuItem onSelect={() => onRestore(pattern)}>Restore</DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onSelect={() => onEdit(pattern)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onDuplicate(pattern)}>
                    Duplicate
                  </DropdownMenuItem>
                  {pattern.status === 'ARCHIVED' ? (
                    <DropdownMenuItem onSelect={() => onUnarchive(pattern)}>
                      Unarchive
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onSelect={() => onArchive(pattern)}>Archive</DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={() => onDelete(pattern)} className="text-destructive">
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
      emptyTitle="No patterns yet"
      emptyDescription="Save a section from the Block Editor, or create one here, to build your library."
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
