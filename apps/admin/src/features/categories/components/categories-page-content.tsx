'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionGate } from '@/components/guards/permission-gate';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { EmptyState } from '@/components/feedback/empty-state';
import { PERMISSIONS } from '@/constants/permissions';
import { CATEGORY_ROUTES } from '@/constants/routes';
import { useCategories } from '../hooks/use-categories';
import { useCategoryTree } from '../hooks/use-category-tree';
import { useDeleteCategory } from '../hooks/use-delete-category';
import { useRestoreCategory } from '../hooks/use-restore-category';
import { CategoryTable } from './category-table';
import { CategoryTree } from './category-tree';
import { CategoryFilters, type CategoryFiltersValue } from './category-filters';
import { DeleteDialog } from './delete-dialog';
import { RestoreDialog } from './restore-dialog';
import { CATEGORIES_DEFAULT_PAGE_SIZE } from '../constants/category.constants';
import type { Category, CategorySortField, CategoryTreeNode } from '../types/category';

type ViewMode = 'list' | 'tree';

/**
 * "Category List"/"Flat View" (brief) and "Tree View" are both satisfied
 * here by one page with a view toggle: List uses `GET /categories`
 * (server pagination/search/sort/status filter, matching every other
 * milestone's list convention); Tree uses `GET /categories/tree`
 * (unlimited nesting) via the reusable `CategoryTree`. Page/sort/filter/
 * search/view state lives in the URL.
 */
export function CategoriesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const view = (searchParams.get('view') as ViewMode | null) ?? 'list';
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? String(CATEGORIES_DEFAULT_PAGE_SIZE));
  const search = searchParams.get('search') ?? '';
  const sortBy = (searchParams.get('sortBy') as CategorySortField | null) ?? undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc' | null) ?? undefined;
  const status = (searchParams.get('status') as CategoryFiltersValue['status']) ?? undefined;

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

  const listQuery = useCategories(
    { page, limit, search: search || undefined, sortBy, sortOrder, status },
    view === 'list',
  );
  const treeQuery = useCategoryTree(view === 'tree');

  const deleteMutation = useDeleteCategory();
  const restoreMutation = useRestoreCategory();

  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [categoryToRestore, setCategoryToRestore] = useState<Category | null>(null);

  const sorting: SortingState = useMemo(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []),
    [sortBy, sortOrder],
  );

  function handleTreeSelect(node: CategoryTreeNode) {
    router.push(CATEGORY_ROUTES.detail(node.id));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        actions={
          <PermissionGate permissions={PERMISSIONS.CATEGORY_CREATE}>
            <Button onClick={() => router.push(CATEGORY_ROUTES.new())}>New category</Button>
          </PermissionGate>
        }
      />

      <Tabs value={view} onValueChange={(next) => updateParams({ view: next === 'list' ? undefined : next })}>
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="tree">Tree</TabsTrigger>
        </TabsList>
      </Tabs>

      {view === 'tree' ? (
        treeQuery.isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : treeQuery.isError ? (
          <ErrorState error={treeQuery.error} onRetry={() => treeQuery.refetch()} />
        ) : !treeQuery.data || treeQuery.data.length === 0 ? (
          <EmptyState title="No categories yet" description="Create your first category to get started." />
        ) : (
          <CategoryTree nodes={treeQuery.data} onSelect={handleTreeSelect} />
        )
      ) : (
        <CategoryTable
          data={listQuery.data?.data ?? []}
          isLoading={listQuery.isLoading}
          error={listQuery.error}
          onRetry={() => listQuery.refetch()}
          pagination={listQuery.data?.meta.pagination}
          onPageChange={(next) => updateParams({ page: String(next) })}
          onLimitChange={(next) => updateParams({ limit: String(next), page: '1' })}
          sorting={sorting}
          onSortingChange={(next) => {
            const first = next[0];
            updateParams({ sortBy: first?.id, sortOrder: first ? (first.desc ? 'desc' : 'asc') : undefined });
          }}
          search={search}
          onSearchChange={(next) => updateParams({ search: next, page: '1' })}
          filters={
            <CategoryFilters value={{ status }} onChange={(next) => updateParams({ status: next.status, page: '1' })} />
          }
          onView={(category) => router.push(CATEGORY_ROUTES.detail(category.id))}
          onEdit={(category) => router.push(CATEGORY_ROUTES.edit(category.id))}
          onDelete={setCategoryToDelete}
          onRestore={setCategoryToRestore}
        />
      )}

      <DeleteDialog
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
        categoryName={categoryToDelete?.name ?? ''}
        onConfirm={() => {
          if (categoryToDelete) deleteMutation.mutate(categoryToDelete.id);
        }}
      />
      <RestoreDialog
        open={Boolean(categoryToRestore)}
        onOpenChange={(open) => !open && setCategoryToRestore(null)}
        categoryName={categoryToRestore?.name ?? ''}
        onConfirm={() => {
          if (categoryToRestore) restoreMutation.mutate(categoryToRestore.id);
        }}
      />
    </div>
  );
}
