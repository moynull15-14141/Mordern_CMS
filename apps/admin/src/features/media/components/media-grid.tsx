'use client';

import { MoreHorizontal } from 'lucide-react';
import { SearchInput } from '@/components/layout/search-input';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import type { PaginationMeta } from '@/types/api';
import { MediaThumbnail } from './media-thumbnail';
import { StatusBadge } from './status-badge';
import { formatFileSize } from '../utils/format-filesize';
import type { Media } from '../types/media';

export interface MediaGridProps {
  data: Media[];
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  pagination?: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  search: string;
  onSearchChange: (value: string) => void;
  filters?: React.ReactNode;
  onView: (media: Media) => void;
  onDelete: (media: Media) => void;
  onRestore: (media: Media) => void;
}

/** Media List — Grid View. Reuses `SearchInput`/`DataTablePagination`
 * (the same primitives `DataTable`'s List View uses internally) rather
 * than duplicating search/pagination logic — only the card layout differs
 * from `MediaTable`. No sort control (sorting isn't meaningful for a
 * thumbnail grid); use List View for that. */
export function MediaGrid({
  data,
  isLoading,
  error,
  onRetry,
  pagination,
  onPageChange,
  onLimitChange,
  search,
  onSearchChange,
  filters,
  onView,
  onDelete,
  onRestore,
}: MediaGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search by filename, alt text, or caption…"
            className="max-w-xs"
          />
          {filters}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : data.length === 0 ? (
        <EmptyState title="No media yet" description="Register your first media asset to get started." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {data.map((media) => (
            <div key={media.id} className="group relative space-y-1.5 rounded-md border border-border p-2">
              <button type="button" onClick={() => onView(media)} className="block w-full text-left">
                <MediaThumbnail type={media.type} className="aspect-square w-full" />
              </button>
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{media.filename}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(media.filesize)}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-6 shrink-0" aria-label={`Actions for ${media.filename}`}>
                      <MoreHorizontal className="size-3.5" aria-hidden="true" />
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
              </div>
              <div className="absolute left-3 top-3">
                <StatusBadge status={media.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination ? (
        <DataTablePagination pagination={pagination} onPageChange={onPageChange} onLimitChange={onLimitChange} />
      ) : null}
    </div>
  );
}
