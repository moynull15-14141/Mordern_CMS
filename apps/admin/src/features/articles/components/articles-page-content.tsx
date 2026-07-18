'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/guards/permission-gate';
import { PERMISSIONS } from '@/constants/permissions';
import { ARTICLE_ROUTES } from '@/constants/routes';
import { useArticles } from '../hooks/use-articles';
import { useDeleteArticle } from '../hooks/use-delete-article';
import { useRestoreArticle } from '../hooks/use-restore-article';
import { ArticleTable } from './article-table';
import { ArticleFilters, type ArticleFiltersValue } from './article-filters';
import { DeleteDialog } from './delete-dialog';
import { RestoreDialog } from './restore-dialog';
import { ARTICLES_DEFAULT_PAGE_SIZE } from '../constants/article.constants';
import type { Article, ArticleSortField } from '../types/article';

/** Articles List — page/sort/filter/search state lives in the URL, matching
 * `UsersPageContent`'s established convention. No row-selection/bulk
 * actions — no bulk endpoint exists on `ArticlesController`. */
export function ArticlesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? String(ARTICLES_DEFAULT_PAGE_SIZE));
  const search = searchParams.get('search') ?? '';
  const sortBy = (searchParams.get('sortBy') as ArticleSortField | null) ?? undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc' | null) ?? undefined;
  const status = (searchParams.get('status') as ArticleFiltersValue['status']) ?? undefined;
  const visibility = (searchParams.get('visibility') as ArticleFiltersValue['visibility']) ?? undefined;
  const authorId = searchParams.get('authorId') ?? undefined;
  const categoryId = searchParams.get('categoryId') ?? undefined;
  const tagId = searchParams.get('tagId') ?? undefined;

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

  const { data, isLoading, error, refetch } = useArticles({
    page,
    limit,
    search: search || undefined,
    sortBy,
    sortOrder,
    status,
    visibility,
    authorId,
    categoryId,
    tagId,
  });

  const deleteMutation = useDeleteArticle();
  const restoreMutation = useRestoreArticle();

  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [articleToRestore, setArticleToRestore] = useState<Article | null>(null);

  const sorting: SortingState = useMemo(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []),
    [sortBy, sortOrder],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Articles"
        actions={
          <PermissionGate permissions={PERMISSIONS.ARTICLE_CREATE}>
            <Button onClick={() => router.push(ARTICLE_ROUTES.new())}>New article</Button>
          </PermissionGate>
        }
      />

      <ArticleTable
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
        filters={
          <ArticleFilters
            value={{ status, visibility, authorId, categoryId, tagId }}
            onChange={(next) =>
              updateParams({
                status: next.status,
                visibility: next.visibility,
                authorId: next.authorId,
                categoryId: next.categoryId,
                tagId: next.tagId,
                page: '1',
              })
            }
          />
        }
        onView={(article) => router.push(ARTICLE_ROUTES.detail(article.id))}
        onEdit={(article) => router.push(ARTICLE_ROUTES.edit(article.id))}
        onDelete={setArticleToDelete}
        onRestore={setArticleToRestore}
      />

      <DeleteDialog
        open={Boolean(articleToDelete)}
        onOpenChange={(open) => !open && setArticleToDelete(null)}
        articleTitle={articleToDelete?.title ?? ''}
        onConfirm={() => {
          if (articleToDelete) deleteMutation.mutate(articleToDelete.id);
        }}
      />
      <RestoreDialog
        open={Boolean(articleToRestore)}
        onOpenChange={(open) => !open && setArticleToRestore(null)}
        articleTitle={articleToRestore?.title ?? ''}
        onConfirm={() => {
          if (articleToRestore) restoreMutation.mutate(articleToRestore.id);
        }}
      />
    </div>
  );
}
