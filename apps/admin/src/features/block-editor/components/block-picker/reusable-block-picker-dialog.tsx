'use client';

import { useMemo, useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { SearchInput } from '@/components/layout/search-input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/empty-state';
import { useReusableBlocks } from '../../hooks/use-reusable-blocks';
import {
  getRecentlyUsedReusableBlockIds,
  recordRecentlyUsedReusableBlock,
} from '../../utils/reusable-block-recency';
import { BlockSummaryPreview } from '../shared/block-summary-preview';
import type { ReusableBlockSummary } from '../../api/reusable-block.types';

export interface ReusableBlockPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The picker's only output — which reusable block was chosen. The
   * caller builds the actual `{type: 'reusable-block', data:
   * {reusableBlockId}}` reference node and inserts it — this component
   * has no tree-mutation knowledge, matching `PatternPickerDialog`'s same
   * separation. */
  onInsert: (reusableBlockId: string) => void;
}

function ReusableBlockRow({
  block,
  onInsert,
}: {
  block: ReusableBlockSummary;
  onInsert: (block: ReusableBlockSummary) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border p-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{block.name}</p>
        <BlockSummaryPreview
          block={{
            type: block.blockType,
            data: block.data as Record<string, unknown>,
            children: block.children,
          }}
        />
      </div>
      <Button type="button" size="sm" onClick={() => onInsert(block)}>
        Insert
      </Button>
    </div>
  );
}

/**
 * A one-step "browse → insert" dialog for Reusable Blocks — the existing
 * system only ever offered a `<Select>`-based picker scoped to the
 * `reusable-block` block's own `reusableBlockId` field (see
 * `reusable-block-ref-field.tsx`), which requires inserting an empty
 * reference block first, then configuring it in the property panel. This
 * reuses the exact same data (`useReusableBlocks`, recency utils,
 * `BlockSummaryPreview`) behind `PatternPickerDialog`'s dialog chrome
 * instead, so both the inline "Add Block" menu and the Page Builder's
 * "Reusable" panel can insert a reusable block in one step — no second
 * reusable-content mechanism, just a friendlier entry point onto the same
 * one.
 */
export function ReusableBlockPickerDialog({
  open,
  onOpenChange,
  onInsert,
}: ReusableBlockPickerDialogProps) {
  const [search, setSearch] = useState('');
  const [recentIds, setRecentIds] = useState<string[]>(() => getRecentlyUsedReusableBlockIds());
  const { data, isLoading } = useReusableBlocks(search || undefined);

  const sorted = useMemo(
    () => [...(data?.data ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [data]
  );
  const recentBlocks = useMemo(() => {
    if (search) return [];
    return recentIds
      .map((id) => sorted.find((block) => block.id === id))
      .filter((block): block is ReusableBlockSummary => Boolean(block));
  }, [search, sorted, recentIds]);
  const recentIdSet = useMemo(() => new Set(recentBlocks.map((block) => block.id)), [recentBlocks]);
  const remaining = sorted.filter((block) => !recentIdSet.has(block.id));

  function handleInsert(block: ReusableBlockSummary) {
    onInsert(block.id);
    recordRecentlyUsedReusableBlock(block.id);
    setRecentIds(getRecentlyUsedReusableBlockIds());
    onOpenChange(false);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="w-full max-w-2xl gap-4">
        <DrawerHeader>
          <DrawerTitle>Insert reusable block</DrawerTitle>
        </DrawerHeader>

        <SearchInput value={search} onChange={setSearch} placeholder="Search reusable blocks…" />

        <div className="max-h-[24rem] space-y-2 overflow-y-auto">
          {recentBlocks.length > 0 ? (
            <>
              <p className="text-xs font-medium text-muted-foreground">Recently used</p>
              {recentBlocks.map((block) => (
                <ReusableBlockRow key={block.id} block={block} onInsert={handleInsert} />
              ))}
            </>
          ) : null}

          {isLoading ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : remaining.length === 0 && recentBlocks.length === 0 ? (
            <EmptyState title="No reusable blocks found" />
          ) : (
            remaining.map((block) => (
              <ReusableBlockRow key={block.id} block={block} onInsert={handleInsert} />
            ))
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
