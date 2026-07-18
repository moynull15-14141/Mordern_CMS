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
import { VISIBILITY_LABELS } from '../constants/article.constants';
import type { Article } from '../types/article';

export interface ArticleTableProps {
  data: Article[];
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
  onView: (article: Article) => void;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
  onRestore: (article: Article) => void;
}

/** Articles List — built on the shared `DataTable` (server-driven
 * pagination/sorting/search/filter, matching `ArticleQueryDto` exactly). No
 * bulk selection column — no bulk endpoint exists on `ArticlesController`. */
export function ArticleTable({
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
}: ArticleTableProps) {
  const columns: ColumnDef<Article, unknown>[] = [
    {
      id: 'title',
      accessorKey: 'title',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.title}</div>
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
      id: 'visibility',
      header: 'Visibility',
      enableSorting: false,
      cell: ({ row }) => VISIBILITY_LABELS[row.original.visibility],
    },
    {
      id: 'category',
      header: 'Category',
      enableSorting: false,
      cell: ({ row }) => row.original.category?.name ?? '—',
    },
    {
      id: 'author',
      header: 'Author',
      enableSorting: false,
      cell: ({ row }) => row.original.author.penName,
    },
    {
      id: 'publishedAt',
      accessorKey: 'publishedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Published" />,
      cell: ({ row }) => (row.original.publishedAt ? new Date(row.original.publishedAt).toLocaleDateString() : '—'),
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
        const article = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for ${article.title}`}>
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onView(article)}>View</DropdownMenuItem>
              {article.deletedAt ? (
                <DropdownMenuItem onSelect={() => onRestore(article)}>Restore</DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onSelect={() => onEdit(article)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onDelete(article)} className="text-destructive">
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
      emptyTitle="No articles yet"
      emptyDescription="Create your first article to get started."
      pagination={pagination}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by title, subtitle, or summary…"
      filters={filters}
      getRowId={(row) => row.id}
    />
  );
}
