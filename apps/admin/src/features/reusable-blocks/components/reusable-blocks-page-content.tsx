'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/guards/permission-gate';
import { PERMISSIONS } from '@/constants/permissions';
import { REUSABLE_BLOCK_ROUTES } from '@/constants/routes';
import { useReusableBlocks } from '../hooks/use-reusable-blocks';
import { useDeleteReusableBlock } from '../hooks/use-delete-reusable-block';
import { useRestoreReusableBlock } from '../hooks/use-restore-reusable-block';
import { useDuplicateReusableBlock } from '../hooks/use-duplicate-reusable-block';
import { ReusableBlockTable } from './reusable-block-table';
import { ReusableBlockFilters, type ReusableBlockFiltersValue } from './reusable-block-filters';
import { DeleteDialog } from './delete-dialog';
import { RestoreDialog } from './restore-dialog';
import { DuplicateDialog } from './duplicate-dialog';
import { REUSABLE_BLOCKS_DEFAULT_PAGE_SIZE } from '../constants/reusable-block.constants';
import type { ReusableBlock, ReusableBlockSortField } from '../types/reusable-block';

/** Reusable Blocks List — page/sort/filter/search state lives in the URL,
 * matching `ThemesPageContent`'s established convention. No row-selection/
 * bulk actions — no bulk endpoint exists on `ReusableBlocksController`. */
export function ReusableBlocksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? String(REUSABLE_BLOCKS_DEFAULT_PAGE_SIZE));
  const search = searchParams.get('search') ?? '';
  const sortBy = (searchParams.get('sortBy') as ReusableBlockSortField | null) ?? undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc' | null) ?? undefined;
  const blockType = searchParams.get('blockType') ?? undefined;

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

  const { data, isLoading, error, refetch } = useReusableBlocks({
    page,
    limit,
    search: search || undefined,
    sortBy,
    sortOrder,
    blockType,
  });

  const deleteMutation = useDeleteReusableBlock();
  const restoreMutation = useRestoreReusableBlock();
  const duplicateMutation = useDuplicateReusableBlock();

  const [blockToDelete, setBlockToDelete] = useState<ReusableBlock | null>(null);
  const [blockToRestore, setBlockToRestore] = useState<ReusableBlock | null>(null);
  const [blockToDuplicate, setBlockToDuplicate] = useState<ReusableBlock | null>(null);

  const sorting: SortingState = useMemo(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []),
    [sortBy, sortOrder]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reusable Blocks"
        actions={
          <PermissionGate permissions={PERMISSIONS.PAGE_MANAGE}>
            <Button onClick={() => router.push(REUSABLE_BLOCK_ROUTES.new())}>
              New reusable block
            </Button>
          </PermissionGate>
        }
      />

      <ReusableBlockTable
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
          updateParams({
            sortBy: first?.id,
            sortOrder: first ? (first.desc ? 'desc' : 'asc') : undefined,
          });
        }}
        search={search}
        onSearchChange={(next) => updateParams({ search: next, page: '1' })}
        filters={
          <ReusableBlockFilters
            value={{ blockType }}
            onChange={(next: ReusableBlockFiltersValue) =>
              updateParams({ blockType: next.blockType, page: '1' })
            }
          />
        }
        onView={(block) => router.push(REUSABLE_BLOCK_ROUTES.detail(block.id))}
        onEdit={(block) => router.push(REUSABLE_BLOCK_ROUTES.edit(block.id))}
        onDuplicate={setBlockToDuplicate}
        onDelete={setBlockToDelete}
        onRestore={setBlockToRestore}
      />

      <DeleteDialog
        open={Boolean(blockToDelete)}
        onOpenChange={(open) => !open && setBlockToDelete(null)}
        block={blockToDelete}
        onConfirm={() => {
          if (blockToDelete) deleteMutation.mutate(blockToDelete.id);
        }}
      />
      <RestoreDialog
        open={Boolean(blockToRestore)}
        onOpenChange={(open) => !open && setBlockToRestore(null)}
        blockName={blockToRestore?.name ?? ''}
        onConfirm={() => {
          if (blockToRestore) restoreMutation.mutate(blockToRestore.id);
        }}
      />
      <DuplicateDialog
        open={Boolean(blockToDuplicate)}
        onOpenChange={(open) => !open && setBlockToDuplicate(null)}
        block={blockToDuplicate}
        isSubmitting={duplicateMutation.isPending}
        onSubmit={(name) => {
          if (blockToDuplicate) {
            duplicateMutation.mutate(
              { source: blockToDuplicate, name },
              { onSuccess: () => setBlockToDuplicate(null) }
            );
          }
        }}
      />
    </div>
  );
}
