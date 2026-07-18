'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/guards/permission-gate';
import { PERMISSIONS } from '@/constants/permissions';
import { TAG_ROUTES } from '@/constants/routes';
import { useTags } from '../hooks/use-tags';
import { useDeleteTag } from '../hooks/use-delete-tag';
import { useRestoreTag } from '../hooks/use-restore-tag';
import { TagTable } from './tag-table';
import { DeleteDialog } from './delete-dialog';
import { RestoreDialog } from './restore-dialog';
import { TAGS_DEFAULT_PAGE_SIZE } from '../constants/tag.constants';
import type { Tag, TagSortField } from '../types/tag';

/** Tags List — page/sort/search state lives in the URL, matching the
 * established convention. No bulk selection — no bulk endpoint exists. */
export function TagsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? String(TAGS_DEFAULT_PAGE_SIZE));
  const search = searchParams.get('search') ?? '';
  const sortBy = (searchParams.get('sortBy') as TagSortField | null) ?? undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc' | null) ?? undefined;

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

  const { data, isLoading, error, refetch } = useTags({ page, limit, search: search || undefined, sortBy, sortOrder });

  const deleteMutation = useDeleteTag();
  const restoreMutation = useRestoreTag();

  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [tagToRestore, setTagToRestore] = useState<Tag | null>(null);

  const sorting: SortingState = useMemo(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []),
    [sortBy, sortOrder],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tags"
        actions={
          <PermissionGate permissions={PERMISSIONS.CATEGORY_CREATE}>
            <Button onClick={() => router.push(TAG_ROUTES.new())}>New tag</Button>
          </PermissionGate>
        }
      />

      <TagTable
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
        onView={(tag) => router.push(TAG_ROUTES.detail(tag.id))}
        onEdit={(tag) => router.push(TAG_ROUTES.edit(tag.id))}
        onDelete={setTagToDelete}
        onRestore={setTagToRestore}
      />

      <DeleteDialog
        open={Boolean(tagToDelete)}
        onOpenChange={(open) => !open && setTagToDelete(null)}
        tagName={tagToDelete?.name ?? ''}
        onConfirm={() => {
          if (tagToDelete) deleteMutation.mutate(tagToDelete.id);
        }}
      />
      <RestoreDialog
        open={Boolean(tagToRestore)}
        onOpenChange={(open) => !open && setTagToRestore(null)}
        tagName={tagToRestore?.name ?? ''}
        onConfirm={() => {
          if (tagToRestore) restoreMutation.mutate(tagToRestore.id);
        }}
      />
    </div>
  );
}
