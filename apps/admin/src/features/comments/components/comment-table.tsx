'use client';

import { MoreHorizontal } from 'lucide-react';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDateTime, truncate } from '@/utils/format';
import type { PaginationMeta } from '@/types/api';
import { CommentStatusBadge } from './comment-status-badge';
import type { Comment } from '../types/comment';

export interface CommentTableProps {
  data: Comment[];
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
  onView: (comment: Comment) => void;
}

export function CommentTable({
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
}: CommentTableProps) {
  const columns: ColumnDef<Comment, unknown>[] = [
    {
      id: 'body',
      accessorKey: 'body',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Comment" />,
      cell: ({ row }) => <div className="max-w-[26rem] whitespace-pre-wrap">{truncate(row.original.body, 140)}</div>,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => <CommentStatusBadge status={row.original.status} />,
    },
    {
      id: 'articleId',
      header: 'Article',
      enableSorting: false,
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.articleId}</span>,
    },
    {
      id: 'author',
      header: 'Author',
      enableSorting: false,
      cell: ({ row }) => (
        <div>
          <div>{row.original.authorName ?? row.original.authorEmail ?? '—'}</div>
          <div className="font-mono text-xs text-muted-foreground">{row.original.userId ?? 'Guest'}</div>
        </div>
      ),
    },
    {
      id: 'votes',
      accessorKey: 'votes',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Votes" />,
      cell: ({ row }) => row.original.votes,
    },
    {
      id: 'replyCount',
      header: 'Replies',
      enableSorting: false,
      cell: ({ row }) => row.original.replyCount,
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
    {
      id: 'updatedAt',
      accessorKey: 'updatedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
      cell: ({ row }) => formatDateTime(row.original.updatedAt),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const comment = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Actions for comment ${comment.id}`}>
                <MoreHorizontal className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onView(comment)}>View</DropdownMenuItem>
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
      emptyTitle="No comments yet"
      emptyDescription="No comments matched the current filters."
      pagination={pagination}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search comment body…"
      filters={filters}
      getRowId={(row) => row.id}
    />
  );
}
