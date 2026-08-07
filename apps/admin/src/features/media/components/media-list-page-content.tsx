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
import { useMediaFolderTree } from '../hooks/use-media-folder-tree';
import {
  useFavoriteMediaList,
  usePinnedMediaList,
  useRecentMediaList,
} from '../hooks/use-media-engagement';
import { MediaTable } from './media-table';
import { MediaGrid } from './media-grid';
import { MediaFilters, type MediaFiltersValue } from './media-filters';
import { DeleteDialog } from './delete-dialog';
import { RestoreDialog } from './restore-dialog';
import { FolderTree } from './folder-tree';
import { BulkActionToolbar } from './bulk-action-toolbar';
import { MEDIA_DEFAULT_PAGE_SIZE } from '../constants/media.constants';
import type { Media, MediaSortField } from '../types/media';

type ViewMode = 'grid' | 'list';
type QuickFilter = 'all' | 'favorites' | 'recent' | 'pinned';

/** Media List — Grid (default) / List view toggle, plus Favorites/Recent/
 * Pinned quick filters (Milestone 5) that swap the data source entirely
 * (those three endpoints are not paginated/searchable the way `GET /media`
 * is — they're bounded lists). The folder-tree sidebar and bulk-select
 * toolbar only apply to the "all" quick filter, where server-side
 * pagination/filtering is real. */
export function MediaListPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const view = (searchParams.get('view') as ViewMode | null) ?? 'grid';
  const quickFilter = (searchParams.get('quick') as QuickFilter | null) ?? 'all';
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
    [router, searchParams]
  );

  const listQuery = useMediaList(
    {
      page,
      limit,
      search: search || undefined,
      sortBy,
      sortOrder,
      type,
      folderId,
      status,
      uploadedBy,
    },
    quickFilter === 'all'
  );
  const favoritesQuery = useFavoriteMediaList(quickFilter === 'favorites');
  const recentQuery = useRecentMediaList(quickFilter === 'recent');
  const pinnedQuery = usePinnedMediaList(quickFilter === 'pinned');
  const folderTreeQuery = useMediaFolderTree();

  const quickFilterData: Media[] | undefined =
    quickFilter === 'favorites'
      ? favoritesQuery.data
      : quickFilter === 'recent'
        ? recentQuery.data
        : quickFilter === 'pinned'
          ? pinnedQuery.data
          : undefined;
  const isQuickFilterLoading =
    quickFilter === 'favorites'
      ? favoritesQuery.isLoading
      : quickFilter === 'recent'
        ? recentQuery.isLoading
        : quickFilter === 'pinned'
          ? pinnedQuery.isLoading
          : false;

  const data = useMemo(
    () => (quickFilter === 'all' ? (listQuery.data?.data ?? []) : (quickFilterData ?? [])),
    [quickFilter, listQuery.data, quickFilterData]
  );
  const isLoading = quickFilter === 'all' ? listQuery.isLoading : isQuickFilterLoading;
  const pagination = quickFilter === 'all' ? listQuery.data?.meta.pagination : undefined;

  const deleteMutation = useDeleteMedia();
  const restoreMutation = useRestoreMedia();

  const [mediaToDelete, setMediaToDelete] = useState<Media | null>(null);
  const [mediaToRestore, setMediaToRestore] = useState<Media | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const sorting: SortingState = useMemo(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []),
    [sortBy, sortOrder]
  );

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allSelectedAreDeleted = useMemo(
    () =>
      selectedIds.size > 0 &&
      data.filter((item) => selectedIds.has(item.id)).every((item) => item.deletedAt),
    [data, selectedIds]
  );

  const filtersSlot = (
    <MediaFilters
      value={{ type, folderId, status, uploadedBy }}
      onChange={(next) =>
        updateParams({
          type: next.type,
          folderId: next.folderId,
          status: next.status,
          uploadedBy: next.uploadedBy,
          page: '1',
        })
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={quickFilter}
          onValueChange={(next) =>
            updateParams({ quick: next === 'all' ? undefined : next, page: '1' })
          }
        >
          <TabsList>
            <TabsTrigger value="all">All media</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="pinned">Pinned</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs
          value={view}
          onValueChange={(next) => updateParams({ view: next === 'grid' ? undefined : next })}
        >
          <TabsList>
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <BulkActionToolbar
        selectedIds={Array.from(selectedIds)}
        onClear={() => setSelectedIds(new Set())}
        allDeleted={allSelectedAreDeleted}
      />

      <div
        className={
          quickFilter === 'all' ? 'grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]' : undefined
        }
      >
        {quickFilter === 'all' ? (
          <aside className="hidden md:block">
            <FolderTree
              nodes={folderTreeQuery.data ?? []}
              selectedId={folderId}
              onSelect={(next) => updateParams({ folderId: next, page: '1' })}
            />
          </aside>
        ) : null}

        <div>
          {view === 'list' ? (
            <MediaTable
              data={data}
              isLoading={isLoading}
              error={quickFilter === 'all' ? listQuery.error : undefined}
              onRetry={() => (quickFilter === 'all' ? listQuery.refetch() : undefined)}
              pagination={pagination}
              onPageChange={(next) => updateParams({ page: String(next) })}
              onLimitChange={(next) => updateParams({ limit: String(next), page: '1' })}
              sorting={sorting}
              onSortingChange={(next) => {
                const first = next[0];
                updateParams({
                  sortBy: first?.id,
                  sortOrder: first ? (first.desc ? 'desc' : 'asc') : undefined,
                });
              }}
              search={search}
              onSearchChange={(next) => updateParams({ search: next, page: '1' })}
              filters={quickFilter === 'all' ? filtersSlot : undefined}
              onView={(media) => router.push(MEDIA_ROUTES.detail(media.id))}
              onDelete={setMediaToDelete}
              onRestore={setMediaToRestore}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
            />
          ) : (
            <MediaGrid
              data={data}
              isLoading={isLoading}
              error={quickFilter === 'all' ? listQuery.error : undefined}
              onRetry={() => (quickFilter === 'all' ? listQuery.refetch() : undefined)}
              pagination={pagination}
              onPageChange={(next) => updateParams({ page: String(next) })}
              onLimitChange={(next) => updateParams({ limit: String(next), page: '1' })}
              search={search}
              onSearchChange={(next) => updateParams({ search: next, page: '1' })}
              filters={quickFilter === 'all' ? filtersSlot : undefined}
              onView={(media) => router.push(MEDIA_ROUTES.detail(media.id))}
              onDelete={setMediaToDelete}
              onRestore={setMediaToRestore}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
            />
          )}
        </div>
      </div>

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
