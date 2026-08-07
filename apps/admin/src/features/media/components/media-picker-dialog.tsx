'use client';

import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { SearchInput } from '@/components/layout/search-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { useMediaList } from '../hooks/use-media-list';
import { useFavoriteMediaList, useRecentMediaList } from '../hooks/use-media-engagement';
import { useUploadMedia } from '../hooks/use-upload-media';
import { MediaThumbnail } from './media-thumbnail';
import { StatusBadge } from './status-badge';
import { UploadDropzone } from './upload-dropzone';
import { TYPE_OPTIONS } from '../constants/media.constants';
import { formatFileSize } from '../utils/format-filesize';
import { extractFileMetadata } from '../utils/extract-file-metadata';
import type { Media, MediaType } from '../types/media';

const ALL_VALUE = '__all__';
const PAGE_SIZE = 12;
type PickerTab = 'browse' | 'recent' | 'favorites' | 'upload';

export interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: Media) => void;
  /** Restrict the picker to one type (e.g. Articles' featured-image field
   * only wants IMAGE) — a real `MediaQueryDto.type` filter, not invented. */
  typeFilter?: MediaType;
  title?: string;
}

function MediaRow({ media, onSelect }: { media: Media; onSelect: (media: Media) => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-auto w-full justify-start gap-3 py-2"
      onClick={() => onSelect(media)}
    >
      <MediaThumbnail
        type={media.type}
        className="size-10 shrink-0"
        status={media.status}
        thumbnailUrl={media.urls.thumbnail ?? media.urls.small}
        blurPlaceholder={media.blurPlaceholder}
        alt={media.altText ?? undefined}
      />
      <span className="flex-1 truncate text-left">
        <span className="block truncate">{media.filename}</span>
        <span className="block text-xs text-muted-foreground">
          {media.width && media.height ? `${media.width}×${media.height} · ` : ''}
          {formatFileSize(media.filesize)}
        </span>
      </span>
      <StatusBadge status={media.status} />
    </Button>
  );
}

/**
 * Reusable Media Picker — the ONE picker for the whole app. Milestone 5
 * adds tabs (Browse/Recent/Favorites/Upload) and inline drag-drop upload
 * (reuses the existing `UploadDropzone`). Browse remains `GET /media`
 * (paginated, searchable, type-filterable); Recent/Favorites are the
 * bounded, non-paginated Milestone 5 endpoints. True multi-select is
 * deferred — gallery's `ListField` "one row → one picker open" already
 * covers multi-image.
 */
export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  typeFilter,
  title = 'Choose media',
}: MediaPickerDialogProps) {
  const [tab, setTab] = useState<PickerTab>('browse');
  const [search, setSearch] = useState('');
  const [type, setType] = useState<MediaType | undefined>(typeFilter);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZE);

  const browseQuery = useMediaList(
    { search: search || undefined, type, page, limit },
    tab === 'browse'
  );
  const recentQuery = useRecentMediaList(tab === 'recent');
  const favoritesQuery = useFavoriteMediaList(tab === 'favorites');
  const { uploadFile } = useUploadMedia();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const browseItems = browseQuery.data?.data ?? [];

  function select(media: Media) {
    onSelect(media);
    onOpenChange(false);
  }

  async function handleUploadFile(file: File) {
    setIsUploading(true);
    setUploadError(null);
    try {
      const metadata = await extractFileMetadata(file);
      const controller = new AbortController();
      const result = await uploadFile({
        input: {
          type: metadata.type,
          filename: metadata.filename,
          mimeType: metadata.mimeType,
          filesize: metadata.filesize,
          width: metadata.width,
          height: metadata.height,
          duration: metadata.duration,
        },
        file,
        signal: controller.signal,
        onStatusChange: () => {},
        onProgress: () => {},
      });
      select(result);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="w-full max-w-2xl gap-4">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>

        <Tabs value={tab} onValueChange={(next) => setTab(next as PickerTab)}>
          <TabsList>
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                value={search}
                onChange={(next) => {
                  setSearch(next);
                  setPage(1);
                }}
                placeholder="Search media…"
                className="max-w-xs"
              />
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

            <div className="max-h-[24rem] space-y-1 overflow-y-auto">
              {browseQuery.isLoading ? (
                <>
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </>
              ) : browseQuery.isError ? (
                <ErrorState error={browseQuery.error} onRetry={() => browseQuery.refetch()} />
              ) : browseItems.length === 0 ? (
                <EmptyState title="No media found" />
              ) : (
                browseItems.map((media) => (
                  <MediaRow key={media.id} media={media} onSelect={select} />
                ))
              )}
            </div>

            {browseQuery.data?.meta.pagination ? (
              <DataTablePagination
                pagination={browseQuery.data.meta.pagination}
                onPageChange={setPage}
                onLimitChange={(next) => {
                  setLimit(next);
                  setPage(1);
                }}
              />
            ) : null}
          </TabsContent>

          <TabsContent value="recent">
            <div className="max-h-[24rem] space-y-1 overflow-y-auto">
              {recentQuery.isLoading ? (
                <Skeleton className="h-14 w-full" />
              ) : recentQuery.isError ? (
                <ErrorState error={recentQuery.error} onRetry={() => recentQuery.refetch()} />
              ) : (recentQuery.data ?? []).length === 0 ? (
                <EmptyState title="No recently viewed media" />
              ) : (
                (recentQuery.data ?? []).map((media) => (
                  <MediaRow key={media.id} media={media} onSelect={select} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="max-h-[24rem] space-y-1 overflow-y-auto">
              {favoritesQuery.isLoading ? (
                <Skeleton className="h-14 w-full" />
              ) : favoritesQuery.isError ? (
                <ErrorState error={favoritesQuery.error} onRetry={() => favoritesQuery.refetch()} />
              ) : (favoritesQuery.data ?? []).length === 0 ? (
                <EmptyState title="No favorited media" />
              ) : (
                (favoritesQuery.data ?? []).map((media) => (
                  <MediaRow key={media.id} media={media} onSelect={select} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-3">
            <UploadDropzone
              onFilesSelected={(files) => {
                const file = files[0];
                if (file) void handleUploadFile(file);
              }}
              disabled={isUploading}
            />
            {isUploading ? <p className="text-sm text-muted-foreground">Uploading…</p> : null}
            {uploadError ? <p className="text-sm text-destructive">{uploadError}</p> : null}
          </TabsContent>
        </Tabs>
      </DrawerContent>
    </Drawer>
  );
}
