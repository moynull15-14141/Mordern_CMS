'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useReusableBlocks } from '../../../hooks/use-reusable-blocks';
import { BlockSummaryPreview } from '../../shared/block-summary-preview';
import {
  getRecentlyUsedReusableBlockIds,
  recordRecentlyUsedReusableBlock,
} from '../../../utils/reusable-block-recency';
import type { ReusableBlockSummary } from '../../../api/reusable-block.types';
import type { FieldProps } from './field.types';

/**
 * A visual picker sourced live from `GET /content-blocks/reusable` — the
 * base `<Select>` primitive is kept (rather than a hand-rolled combobox)
 * because it already gives correct keyboard navigation/focus-trap/typeahead
 * "for free"; only the item content is enriched. Search + a compact
 * inline preview per option (via `summarizeBlock`) + a "Recently used"
 * group (client-only, `reusable-block-recency.ts`) shown when not
 * searching + alphabetical ordering + a disabled "Favorites — coming
 * soon" placeholder (future-ready, no backend support yet).
 */
export function ReusableBlockRefField({ descriptor, value, onChange }: FieldProps) {
  const [search, setSearch] = useState('');
  // Read into React state (rather than reading `localStorage` directly in
  // a `useMemo`) so recording a new selection re-renders this field
  // immediately — `localStorage` writes are invisible to React's
  // dependency tracking, so a memo keyed on `[search, sorted]` would stay
  // stale after `handleChange` records a new id without either of those
  // actually changing.
  const [recentIds, setRecentIds] = useState<string[]>(() => getRecentlyUsedReusableBlockIds());
  const { data, isLoading } = useReusableBlocks(search || undefined);
  const current = typeof value === 'string' ? value : undefined;

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

  function handleChange(id: string) {
    onChange(id);
    recordRecentlyUsedReusableBlock(id);
    setRecentIds(getRecentlyUsedReusableBlockIds());
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search reusable blocks…"
          className="pl-8"
        />
      </div>
      <Select value={current} onValueChange={handleChange}>
        <SelectTrigger id={`field-${descriptor.key}`} aria-label={descriptor.label}>
          <SelectValue placeholder={isLoading ? 'Loading…' : 'Select a reusable block…'} />
        </SelectTrigger>
        <SelectContent>
          {recentBlocks.length > 0 ? (
            <>
              <SelectGroup>
                <SelectLabel>Recently used</SelectLabel>
                {recentBlocks.map((block) => (
                  <ReusableBlockOption key={block.id} block={block} />
                ))}
              </SelectGroup>
              <SelectSeparator />
            </>
          ) : null}

          <SelectGroup>
            <SelectLabel>
              {search ? 'Search results (A–Z)' : 'All reusable blocks (A–Z)'}
            </SelectLabel>
            {remaining.length === 0 && recentBlocks.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                {isLoading ? 'Loading…' : 'No reusable blocks found.'}
              </div>
            ) : (
              remaining.map((block) => <ReusableBlockOption key={block.id} block={block} />)
            )}
          </SelectGroup>

          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Favorites</SelectLabel>
            <SelectItem value="__favorites_coming_soon__" disabled>
              Coming soon
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

/** No explicit `aria-label` here — Radix's `SelectItem` already points
 * `aria-labelledby` at its `ItemText` content (name + preview), and
 * `aria-labelledby` takes precedence over `aria-label` in accessible-name
 * computation, so an `aria-label` on the item would be silently ignored
 * anyway. The resulting accessible name (name + preview text) is a
 * feature, not a gap — a screen reader user gets the same "what is this"
 * context a sighted user gets from the preview. */
function ReusableBlockOption({ block }: { block: ReusableBlockSummary }) {
  return (
    <SelectItem value={block.id}>
      <div className="flex flex-col gap-0.5 py-0.5">
        <span>{block.name}</span>
        <BlockSummaryPreview
          block={{
            type: block.blockType,
            data: block.data as Record<string, unknown>,
            children: block.children,
          }}
        />
      </div>
    </SelectItem>
  );
}
