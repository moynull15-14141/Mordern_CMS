'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { PermissionGate } from '@/components/guards/permission-gate';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { EmptyState } from '@/components/feedback/empty-state';
import { PERMISSIONS } from '@/constants/permissions';
import { ARTICLE_ROUTES } from '@/constants/routes';
import { useArticle } from '../hooks/use-article';
import { useDeleteArticle } from '../hooks/use-delete-article';
import { useRestoreArticle } from '../hooks/use-restore-article';
import { usePublishArticle } from '../hooks/use-publish-article';
import { useScheduleArticle } from '../hooks/use-schedule-article';
import { useArticleRevisions } from '../hooks/use-article-revisions';
import { StatusBadge } from './status-badge';
import { DeleteDialog } from './delete-dialog';
import { RestoreDialog } from './restore-dialog';
import { PublishDialog } from './publish-dialog';
import { ScheduleDialog } from './schedule-dialog';
import { VISIBILITY_LABELS } from '../constants/article.constants';

export interface ArticleDetailPageContentProps {
  articleId: string;
}

/**
 * Article Details — metadata, SEO, category, tags, author, revision
 * summary (list only; the backend's `/revisions/compare` returns metadata,
 * not a visual diff — out of this milestone's scope). Publish/Schedule
 * appear only for a non-published, non-deleted article and require
 * `article.publish` (editorial tier, distinct from `article.update`'s
 * ownership-tier gate).
 */
export function ArticleDetailPageContent({ articleId }: ArticleDetailPageContentProps) {
  const router = useRouter();
  const { data: article, isLoading, error, refetch } = useArticle(articleId);
  const { data: revisions, isLoading: revisionsLoading, error: revisionsError } = useArticleRevisions(articleId);

  const deleteMutation = useDeleteArticle();
  const restoreMutation = useRestoreArticle();
  const publishMutation = usePublishArticle();
  const scheduleMutation = useScheduleArticle(articleId);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  if (!article) {
    return <EmptyState title="Article not found" />;
  }

  const canPublishOrSchedule = !article.deletedAt && article.status !== 'PUBLISHED';

  return (
    <div className="space-y-6">
      <PageHeader
        title={article.title}
        description={article.subtitle ?? undefined}
        actions={
          <div className="flex flex-wrap gap-2">
            {article.deletedAt ? (
              <PermissionGate permissions={PERMISSIONS.ARTICLE_DELETE}>
                <Button variant="outline" onClick={() => setRestoreOpen(true)}>
                  Restore
                </Button>
              </PermissionGate>
            ) : (
              <>
                <PermissionGate permissions={PERMISSIONS.ARTICLE_UPDATE}>
                  <Button variant="outline" onClick={() => router.push(ARTICLE_ROUTES.edit(article.id))}>
                    Edit
                  </Button>
                </PermissionGate>
                {canPublishOrSchedule ? (
                  <PermissionGate permissions={PERMISSIONS.ARTICLE_PUBLISH}>
                    <Button variant="outline" onClick={() => setPublishOpen(true)}>
                      Publish
                    </Button>
                    <Button variant="outline" onClick={() => setScheduleOpen(true)}>
                      Schedule
                    </Button>
                  </PermissionGate>
                ) : null}
                <PermissionGate permissions={PERMISSIONS.ARTICLE_DELETE}>
                  <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                    Delete
                  </Button>
                </PermissionGate>
              </>
            )}
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <CardTitle>{article.title}</CardTitle>
          <StatusBadge status={article.status} />
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Slug</dt>
              <dd className="font-mono">{article.slug}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Visibility</dt>
              <dd>{VISIBILITY_LABELS[article.visibility]}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Author</dt>
              <dd>{article.author.penName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Category</dt>
              <dd>{article.category?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Tags</dt>
              <dd>{article.tags.length > 0 ? article.tags.map((tag) => tag.name).join(', ') : '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Language / Locale</dt>
              <dd>
                {article.language} / {article.locale}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Published</dt>
              <dd>{article.publishedAt ? new Date(article.publishedAt).toLocaleString() : '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Scheduled</dt>
              <dd>{article.scheduledAt ? new Date(article.scheduledAt).toLocaleString() : '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Word count / Reading time</dt>
              <dd>
                {article.wordCount ?? '—'} words
                {article.readingTime ? ` · ${article.readingTime} min read` : ''}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Updated</dt>
              <dd>{new Date(article.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
          {article.summary ? (
            <div className="mt-4">
              <dt className="text-sm text-muted-foreground">Summary</dt>
              <dd className="text-sm">{article.summary}</dd>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent>
          {article.seo ? (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">SEO title</dt>
                <dd>{article.seo.title ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Canonical URL</dt>
                <dd className="break-all">{article.seo.canonicalUrl ?? article.canonicalUrl ?? '—'}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">SEO description</dt>
                <dd>{article.seo.description ?? '—'}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Keywords</dt>
                <dd>{article.seo.keywords?.length ? article.seo.keywords.join(', ') : '—'}</dd>
              </div>
            </dl>
          ) : (
            <EmptyState title="No SEO metadata set" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revisions</CardTitle>
        </CardHeader>
        <CardContent>
          {revisionsLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : revisionsError ? (
            <ErrorState error={revisionsError} />
          ) : !revisions || revisions.length === 0 ? (
            <EmptyState title="No revisions yet" />
          ) : (
            <ul className="space-y-2 text-sm">
              {revisions.map((revision) => (
                <li key={revision.version} className="flex items-center justify-between border-b border-border pb-2">
                  <span>
                    v{revision.version} — {revision.title}
                  </span>
                  <span className="text-muted-foreground">{new Date(revision.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        articleTitle={article.title}
        onConfirm={() => deleteMutation.mutate(article.id)}
      />
      <RestoreDialog
        open={restoreOpen}
        onOpenChange={setRestoreOpen}
        articleTitle={article.title}
        onConfirm={() => restoreMutation.mutate(article.id)}
      />
      <PublishDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        articleTitle={article.title}
        onConfirm={() => publishMutation.mutate(article.id)}
      />
      <ScheduleDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        articleTitle={article.title}
        onSubmit={(input) => scheduleMutation.mutate(input, { onSuccess: () => setScheduleOpen(false) })}
        isSubmitting={scheduleMutation.isPending}
      />
    </div>
  );
}
