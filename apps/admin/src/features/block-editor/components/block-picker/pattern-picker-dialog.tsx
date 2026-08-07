'use client';

import { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { toast } from '@/lib/toast';
import { isApiError } from '@/lib/api-error';
import { env } from '@/lib/env';
// Deliberately NOT importing from '@/features/patterns' (the barrel) —
// that barrel re-exports the Pattern Library's page-content components,
// which embed `BlockEditor` themselves. Since this file is itself part of
// `BlockEditor`'s own component tree, going through the barrel would
// create a real runtime import cycle (block-editor -> patterns barrel ->
// pattern-form.tsx -> block-editor, with `block-editor`'s own exports not
// yet initialized on the way back in — `blockTreeSchema` etc. would import
// as `undefined`). Importing these specific leaf modules directly avoids
// pulling in anything that imports `BlockEditor`.
import { usePatterns } from '@/features/patterns/hooks/use-patterns';
import { useFavoritePatterns } from '@/features/patterns/hooks/use-pattern-favorites';
import { patternsApi } from '@/features/patterns/services/patterns.api';
import {
  getRecentlyUsedPatternIds,
  recordRecentlyUsedPattern,
} from '@/features/patterns/utils/pattern-recency';
import type { PatternSummary } from '@/features/patterns/types/pattern';
import type { BlockNode } from '../../types/block.types';

const ALL_VALUE = '__all__';
type PickerTab = 'browse' | 'recent' | 'favorites';

export interface PatternPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The picker's only output — which pattern was chosen and its
   * freshly-fetched `body.blocks`. Cloning-with-fresh-ids happens in the
   * store's `insertClonedNodes`, not here; this component's job ends at
   * "which pattern, and what were its blocks at the moment of insertion." */
  onInsert: (patternId: string, nodes: BlockNode[]) => void;
  /** Optional — pre-selects the Browse tab's category filter (e.g. the
   * Page Builder's "Sections" panel opening straight into "Hero"). Purely
   * an initial value; the user can still change or clear it. */
  initialCategory?: string;
}

function PatternRow({
  pattern,
  onInsert,
  isInserting,
}: {
  pattern: PatternSummary;
  onInsert: (pattern: PatternSummary) => void;
  isInserting: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border p-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{pattern.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {pattern.category ?? 'Uncategorized'} · {pattern.blockCount} block
          {pattern.blockCount === 1 ? '' : 's'}
        </p>
        {pattern.tags.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {pattern.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
      <Button type="button" variant="ghost" size="icon" aria-label="Preview pattern" asChild>
        <a
          href={`${env.NEXT_PUBLIC_WEB_URL}/preview/patterns/${pattern.id}`}
          target="_blank"
          rel="noreferrer"
        >
          <Eye className="size-4" />
        </a>
      </Button>
      <Button type="button" size="sm" onClick={() => onInsert(pattern)} disabled={isInserting}>
        Insert
      </Button>
    </div>
  );
}

/**
 * "Add Block → Patterns → Pattern Picker" (Milestone 6 spec) — reuses the
 * same Drawer/Tabs/search/empty/error shell `MediaPickerDialog` already
 * established rather than inventing a second picker chrome. One list call
 * per tab (Browse/Recent/Favorites), never one call per pattern — the
 * spec's "insertion must not require additional network requests per
 * block" is honored by fetching the chosen pattern's full body exactly
 * once, at the moment Insert is clicked.
 */
export function PatternPickerDialog({
  open,
  onOpenChange,
  onInsert,
  initialCategory,
}: PatternPickerDialogProps) {
  const [tab, setTab] = useState<PickerTab>('browse');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [insertingId, setInsertingId] = useState<string | null>(null);

  const browseQuery = usePatterns({
    status: 'ACTIVE',
    search: search || undefined,
    category,
    limit: 100,
  });
  const favoritesQuery = useFavoritePatterns();

  const browseItems = useMemo(() => browseQuery.data?.data ?? [], [browseQuery.data]);
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          browseItems
            .map((pattern) => pattern.category)
            .filter((value): value is string => Boolean(value))
        )
      ),
    [browseItems]
  );

  const recentIds = getRecentlyUsedPatternIds();
  const recentItems = useMemo(
    () =>
      recentIds
        .map((id) => browseItems.find((pattern) => pattern.id === id))
        .filter((pattern): pattern is PatternSummary => Boolean(pattern)),
    [recentIds, browseItems]
  );

  async function handleInsert(pattern: PatternSummary) {
    setInsertingId(pattern.id);
    try {
      const full = await patternsApi.get(pattern.id);
      onInsert(pattern.id, full.body.blocks);
      recordRecentlyUsedPattern(pattern.id);
      onOpenChange(false);
    } catch (error) {
      toast.error(isApiError(error) ? error.message : 'Could not insert this pattern.');
    } finally {
      setInsertingId(null);
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="w-full max-w-2xl gap-4">
        <DrawerHeader>
          <DrawerTitle>Insert pattern</DrawerTitle>
        </DrawerHeader>

        <Tabs value={tab} onValueChange={(next) => setTab(next as PickerTab)}>
          <TabsList>
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search patterns…"
                className="max-w-xs"
              />
              <Select
                value={category ?? ALL_VALUE}
                onValueChange={(next) => setCategory(next === ALL_VALUE ? undefined : next)}
              >
                <SelectTrigger className="w-40" aria-label="Filter by category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>All categories</SelectItem>
                  {categories.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="max-h-[24rem] space-y-2 overflow-y-auto">
              {browseQuery.isLoading ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : browseQuery.isError ? (
                <ErrorState error={browseQuery.error} onRetry={() => browseQuery.refetch()} />
              ) : browseItems.length === 0 ? (
                <EmptyState title="No patterns found" />
              ) : (
                browseItems.map((pattern) => (
                  <PatternRow
                    key={pattern.id}
                    pattern={pattern}
                    onInsert={handleInsert}
                    isInserting={insertingId === pattern.id}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="recent">
            <div className="max-h-[24rem] space-y-2 overflow-y-auto">
              {recentItems.length === 0 ? (
                <EmptyState title="No recently used patterns" />
              ) : (
                recentItems.map((pattern) => (
                  <PatternRow
                    key={pattern.id}
                    pattern={pattern}
                    onInsert={handleInsert}
                    isInserting={insertingId === pattern.id}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <div className="max-h-[24rem] space-y-2 overflow-y-auto">
              {favoritesQuery.isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : favoritesQuery.isError ? (
                <ErrorState error={favoritesQuery.error} onRetry={() => favoritesQuery.refetch()} />
              ) : (favoritesQuery.data ?? []).length === 0 ? (
                <EmptyState title="No favorited patterns" />
              ) : (
                (favoritesQuery.data ?? []).map((pattern) => (
                  <PatternRow
                    key={pattern.id}
                    pattern={pattern}
                    onInsert={handleInsert}
                    isInserting={insertingId === pattern.id}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DrawerContent>
    </Drawer>
  );
}
