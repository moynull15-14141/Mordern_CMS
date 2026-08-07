'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/guards/permission-gate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { PERMISSIONS } from '@/constants/permissions';
import { PATTERN_ROUTES } from '@/constants/routes';
import { usePatterns } from '../hooks/use-patterns';
import {
  useArchivePattern,
  useDeletePattern,
  useDuplicatePattern,
  useRestorePattern,
  useUnarchivePattern,
} from '../hooks/use-pattern-mutations';
import {
  useAddPatternFavorite,
  useFavoritePatterns,
  useRemovePatternFavorite,
} from '../hooks/use-pattern-favorites';
import { getRecentlyUsedPatternIds } from '../utils/pattern-recency';
import { PatternTable } from './pattern-table';
import { PatternFilters, type PatternFiltersValue } from './pattern-filters';
import { PATTERNS_DEFAULT_PAGE_SIZE } from '../constants/pattern.constants';
import type { PatternSortField, PatternStatus, PatternSummary } from '../types/pattern';

type ViewTab = 'all' | 'favorites' | 'recent';

/** Pattern Library List — page/sort/filter/search state in the URL
 * (matches `ReusableBlocksPageContent`), plus Favorites/Recently Used
 * views (spec §"Pattern Library"). Favorites reuses the DB-backed
 * mechanism Milestone 5's Media Favorites established; Recently Used
 * reuses `pattern-recency.ts`'s client-only localStorage list — neither
 * is a new mechanism. */
export function PatternsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? String(PATTERNS_DEFAULT_PAGE_SIZE));
  const search = searchParams.get('search') ?? '';
  const sortBy = (searchParams.get('sortBy') as PatternSortField | null) ?? undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc' | null) ?? undefined;
  const category = searchParams.get('category') ?? undefined;
  const status = (searchParams.get('status') as PatternStatus | null) ?? undefined;
  const tab = (searchParams.get('view') as ViewTab | null) ?? 'all';

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

  const listQuery = usePatterns({
    page,
    limit,
    search: search || undefined,
    sortBy,
    sortOrder,
    category,
    status,
  });
  const favoritesQuery = useFavoritePatterns();
  const addFavoriteMutation = useAddPatternFavorite();
  const removeFavoriteMutation = useRemovePatternFavorite();
  const archiveMutation = useArchivePattern();
  const unarchiveMutation = useUnarchivePattern();
  const deleteMutation = useDeletePattern();
  const restoreMutation = useRestorePattern();
  const duplicateMutation = useDuplicatePattern();

  const [patternToDelete, setPatternToDelete] = useState<PatternSummary | null>(null);
  const [patternToArchive, setPatternToArchive] = useState<PatternSummary | null>(null);

  const favoriteIds = useMemo(
    () => new Set((favoritesQuery.data ?? []).map((pattern) => pattern.id)),
    [favoritesQuery.data]
  );

  function toggleFavorite(pattern: PatternSummary) {
    if (favoriteIds.has(pattern.id)) {
      removeFavoriteMutation.mutate(pattern.id);
    } else {
      addFavoriteMutation.mutate(pattern.id);
    }
  }

  const listItems = useMemo(() => listQuery.data?.data ?? [], [listQuery.data]);
  const categoryOptions = useMemo(
    () =>
      Array.from(new Set(listItems.map((p) => p.category).filter((c): c is string => Boolean(c)))),
    [listItems]
  );

  const recentIds = getRecentlyUsedPatternIds();
  const recentItems = useMemo(
    () =>
      recentIds
        .map((id) => listItems.find((pattern) => pattern.id === id))
        .filter((pattern): pattern is PatternSummary => Boolean(pattern)),
    [recentIds, listItems]
  );

  const sorting: SortingState = useMemo(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []),
    [sortBy, sortOrder]
  );

  const sharedRowProps = {
    favoriteIds,
    onToggleFavorite: toggleFavorite,
    onView: (pattern: PatternSummary) => router.push(PATTERN_ROUTES.detail(pattern.id)),
    onEdit: (pattern: PatternSummary) => router.push(PATTERN_ROUTES.edit(pattern.id)),
    onDuplicate: (pattern: PatternSummary) => duplicateMutation.mutate(pattern.id),
    onArchive: setPatternToArchive,
    onUnarchive: (pattern: PatternSummary) => unarchiveMutation.mutate(pattern.id),
    onDelete: setPatternToDelete,
    onRestore: (pattern: PatternSummary) => restoreMutation.mutate(pattern.id),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patterns"
        actions={
          <PermissionGate permissions={PERMISSIONS.PAGE_MANAGE}>
            <Button onClick={() => router.push(PATTERN_ROUTES.new())}>New pattern</Button>
          </PermissionGate>
        }
      />

      <Tabs
        value={tab}
        onValueChange={(next) => updateParams({ view: next === 'all' ? undefined : next })}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="recent">Recently used</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <PatternTable
            data={listItems}
            isLoading={listQuery.isLoading}
            error={listQuery.error}
            onRetry={() => listQuery.refetch()}
            pagination={listQuery.data?.meta.pagination}
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
            filters={
              <PatternFilters
                value={{ category, status }}
                onChange={(next: PatternFiltersValue) =>
                  updateParams({ category: next.category, status: next.status, page: '1' })
                }
                categoryOptions={categoryOptions}
              />
            }
            {...sharedRowProps}
          />
        </TabsContent>

        <TabsContent value="favorites">
          <PatternTable
            data={favoritesQuery.data ?? []}
            isLoading={favoritesQuery.isLoading}
            error={favoritesQuery.error}
            onRetry={() => favoritesQuery.refetch()}
            {...sharedRowProps}
          />
        </TabsContent>

        <TabsContent value="recent">
          <PatternTable data={recentItems} {...sharedRowProps} />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={Boolean(patternToDelete)}
        onOpenChange={(open) => !open && setPatternToDelete(null)}
        title="Delete pattern"
        description={`Delete "${patternToDelete?.name}"? This can be undone by restoring it later. Pages/articles that already inserted a copy of this pattern are unaffected.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (patternToDelete) deleteMutation.mutate(patternToDelete.id);
        }}
      />
      <ConfirmDialog
        open={Boolean(patternToArchive)}
        onOpenChange={(open) => !open && setPatternToArchive(null)}
        title="Archive pattern"
        description={`Archive "${patternToArchive?.name}"? It will be hidden from the Pattern Picker until unarchived.`}
        confirmLabel="Archive"
        onConfirm={() => {
          if (patternToArchive) archiveMutation.mutate(patternToArchive.id);
        }}
      />
    </div>
  );
}
