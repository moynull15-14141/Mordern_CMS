'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SortingState } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/page-header';
import { ROUTES } from '@/constants/routes';
import { COMMENTS_DEFAULT_PAGE_SIZE } from '../constants/comments.constants';
import { useComments } from '../hooks/use-comments';
import { CommentTable } from './comment-table';
import { CommentFilters, type CommentFiltersValue } from './comment-filters';
import type { Comment } from '../types/comment';
import type { CommentSortField } from '../constants/comments.constants';

export function CommentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? String(COMMENTS_DEFAULT_PAGE_SIZE));
  const search = searchParams.get('search') ?? '';
  const sortBy = (searchParams.get('sortBy') as CommentSortField | null) ?? undefined;
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc' | null) ?? undefined;
  const status = (searchParams.get('status') as CommentFiltersValue['status']) ?? undefined;
  const articleId = searchParams.get('articleId') ?? undefined;
  const userId = searchParams.get('userId') ?? undefined;

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '') next.delete(key);
        else next.set(key, value);
      }
      router.push(`?${next.toString()}`);
    },
    [router, searchParams]
  );

  const { data, isLoading, error, refetch } = useComments({
    page,
    limit,
    search: search || undefined,
    sortBy,
    sortOrder,
    status,
    articleId,
    userId,
  });

  const sorting: SortingState = useMemo(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []),
    [sortBy, sortOrder]
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Comments" description="Review and moderate comments across the site." />

      <CommentTable
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
          <CommentFilters
            value={{ status, articleId, userId }}
            onChange={(next) =>
              updateParams({
                status: next.status,
                articleId: next.articleId,
                userId: next.userId,
                page: '1',
              })
            }
          />
        }
        onView={(comment: Comment) => router.push(`${ROUTES.COMMENTS}/${comment.id}`)}
      />
    </div>
  );
}
