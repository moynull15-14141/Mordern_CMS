'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionGate } from '@/components/guards/permission-gate';
import { PERMISSIONS } from '@/constants/permissions';
import { MEDIA_ROUTES } from '@/constants/routes';
import { useMediaList } from '../hooks/use-media-list';
import { useDeleteMedia } from '../hooks/use-delete-media';
import { useRestoreMedia } from '../hooks/use-restore-media';
import { MediaTable } from './media-table';
import { MediaGrid } from './media-grid';
import { MediaFilters, type MediaFiltersValue } from './media-filters';
import { DeleteDialog } from './delete-dialog';
import { RestoreDialog } from './restore-dialog';
import { MEDIA_DEFAULT_PAGE_SIZE } from '../constants/media.constants';
import type { Media, MediaSortField } from '../types/media';

type ViewMode = 'grid' | 'list';

/** Media List — Grid (default) / List view toggle. List uses `MediaTable`
 * (server sort, via `DataTable`); Grid uses `MediaGrid` (no sort control —
 * not meaningful for a thumbnail grid). Both share the same server
 * pagination/search/filter state, all URL-driven. */
export function MediaListPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const view = (searchParams.get('view') as ViewMode | null) ?? 'grid';
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? String(MEDIA_DEFAULT_PAGE_SIZE));
  const search = searchParams.get('search') ?? '';
  const sortBy = (searchParams.get('sortBy') as MediaSortField | null) ?? undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc' | null) ?? undefined;
  const type = (searchParams.get('type') as MediaFiltersValue['type']) ?? undefined;
  const folderId = searchParams.get('folderId') ?? undefined;
  const status = (searchParams.get('status') as MediaFiltersValue['status']) ?? undefined;
  const uploadedBy = searchParams.get('uploadedBy') ?? undefined;

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      router.push(`?${next.toString()}`);
    },
    [router, searchParams],
  );

  const { data, isLoading, error, refetch } = useMediaList({
    page,
    limit,
    search: search || undefined,
    sortBy,
    sortOrder,
    type,
    folderId,
    status,
    uploadedBy,
  });

  const deleteMutation = useDeleteMedia();
  const restoreMutation = useRestoreMedia();

  const [mediaToDelete, setMediaToDelete] = useState<Media | null>(null);
  const [mediaToRestore, setMediaToRestore] = useState<Media | null>(null);

  const sorting: SortingState = useMemo(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []),
    [sortBy, sortOrder],
  );

  const filtersSlot = (
    <MediaFilters
      value={{ type, folderId, status, uploadedBy }}
      onChange={(next) =>
        updateParams({ type: next.type, folderId: next.folderId, status: next.status, uploadedBy: next.uploadedBy, page: '1' })
      }
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        actions={
          <PermissionGate permissions={PERMISSIONS.MEDIA_UPLOAD}>
            <Button onClick={() => router.push(MEDIA_ROUTES.upload())}>Upload media</Button>
          </PermissionGate>
        }
      />

      <Tabs value={view} onValueChange={(next) => updateParams({ view: next === 'grid' ? undefined : next })}>
        <TabsList>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>
      </Tabs>

      {view === 'list' ? (
        <MediaTable
          data={data?.data ?? []}
          isLoading={isLoading}
          error={error}
          onRetry={() => refetch()}
          pagination={data?.meta.pagination}
          onPageChange={(next) => updateParams({ page: String(next) })}
          onLimitChange={(next) => updateParams({ limit: String(next), page: '1' })}
          sorting={sorting}
          onSortingChange={(next) => {
            const first = next[0];
            updateParams({ sortBy: first?.id, sortOrder: first ? (first.desc ? 'desc' : 'asc') : undefined });
          }}
          search={search}
          onSearchChange={(next) => updateParams({ search: next, page: '1' })}
          filters={filtersSlot}
          onView={(media) => router.push(MEDIA_ROUTES.detail(media.id))}
          onDelete={setMediaToDelete}
          onRestore={setMediaToRestore}
        />
      ) : (
        <MediaGrid
          data={data?.data ?? []}
          isLoading={isLoading}
          error={error}
          onRetry={() => refetch()}
          pagination={data?.meta.pagination}
          onPageChange={(next) => updateParams({ page: String(next) })}
          onLimitChange={(next) => updateParams({ limit: String(next), page: '1' })}
          search={search}
          onSearchChange={(next) => updateParams({ search: next, page: '1' })}
          filters={filtersSlot}
          onView={(media) => router.push(MEDIA_ROUTES.detail(media.id))}
          onDelete={setMediaToDelete}
          onRestore={setMediaToRestore}
        />
      )}

      <DeleteDialog
        open={Boolean(mediaToDelete)}
        onOpenChange={(open) => !open && setMediaToDelete(null)}
        filename={mediaToDelete?.filename ?? ''}
        onConfirm={() => {
          if (mediaToDelete) deleteMutation.mutate(mediaToDelete.id);
        }}
      />
      <RestoreDialog
        open={Boolean(mediaToRestore)}
        onOpenChange={(open) => !open && setMediaToRestore(null)}
        filename={mediaToRestore?.filename ?? ''}
        onConfirm={() => {
          if (mediaToRestore) restoreMutation.mutate(mediaToRestore.id);
        }}
      />
    </div>
  );
}
