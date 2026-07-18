'use client';

import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { SearchInput } from '@/components/layout/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { useMediaList } from '../hooks/use-media-list';
import { MediaThumbnail } from './media-thumbnail';
import { StatusBadge } from './status-badge';
import { TYPE_OPTIONS } from '../constants/media.constants';
import { formatFileSize } from '../utils/format-filesize';
import type { Media, MediaType } from '../types/media';

const ALL_VALUE = '__all__';
const PAGE_SIZE = 12;

export interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: Media) => void;
  /** Restrict the picker to one type (e.g. Articles' featured-image field
   * only wants IMAGE) — a real `MediaQueryDto.type` filter, not invented. */
  typeFilter?: MediaType;
  title?: string;
}

/**
 * Reusable Media Picker — `GET /media` (paginated, searchable, type-
 * filterable). This is the ONE picker for the whole app; Articles'
 * featured-image field reuses it directly instead of its own
 * Frontend-Milestone-5 placeholder (see `features/articles/components/
 * featured-image-field.tsx`). No real thumbnail preview — `MediaResponseDto`
 * has no URL field and no download/streaming endpoint exists anywhere on
 * the backend.
 */
export function MediaPickerDialog({ open, onOpenChange, onSelect, typeFilter, title = 'Choose media' }: MediaPickerDialogProps) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<MediaType | undefined>(typeFilter);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZE);

  const { data, isLoading, isError, error, refetch } = useMediaList({
    search: search || undefined,
    type,
    page,
    limit,
  });
  const items = data?.data ?? [];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="w-full max-w-2xl gap-4">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={search} onChange={(next) => { setSearch(next); setPage(1); }} placeholder="Search media…" className="max-w-xs" />
          {typeFilter ? null : (
            <Select
              value={type ?? ALL_VALUE}
              onValueChange={(next) => {
                setType(next === ALL_VALUE ? undefined : (next as MediaType));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36" aria-label="Filter by type">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All types</SelectItem>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="max-h-[28rem] space-y-1 overflow-y-auto">
          {isLoading ? (
            <>
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </>
          ) : isError ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : items.length === 0 ? (
            <EmptyState title="No media found" />
          ) : (
            items.map((media) => (
              <Button
                key={media.id}
                type="button"
                variant="outline"
                className="h-auto w-full justify-start gap-3 py-2"
                onClick={() => {
                  onSelect(media);
                  onOpenChange(false);
                }}
              >
                <MediaThumbnail type={media.type} className="size-10 shrink-0" />
                <span className="flex-1 truncate text-left">
                  <span className="block truncate">{media.filename}</span>
                  <span className="block text-xs text-muted-foreground">
                    {media.width && media.height ? `${media.width}×${media.height} · ` : ''}
                    {formatFileSize(media.filesize)}
                  </span>
                </span>
                <StatusBadge status={media.status} />
              </Button>
            ))
          )}
        </div>

        {data?.meta.pagination ? (
          <DataTablePagination
            pagination={data.meta.pagination}
            onPageChange={setPage}
            onLimitChange={(next) => {
              setLimit(next);
              setPage(1);
            }}
          />
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
