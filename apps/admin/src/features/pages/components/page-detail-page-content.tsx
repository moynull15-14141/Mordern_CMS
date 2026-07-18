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
import { PAGE_ROUTES } from '@/constants/routes';
import { usePage } from '../hooks/use-page';
import { useDeletePage } from '../hooks/use-delete-page';
import { useRestorePage } from '../hooks/use-restore-page';
import { usePublishPage } from '../hooks/use-publish-page';
import { StatusBadge } from './status-badge';
import { DeleteDialog } from './delete-dialog';
import { RestoreDialog } from './restore-dialog';
import { PublishDialog } from './publish-dialog';

export interface PageDetailPageContentProps {
  pageId: string;
}

/**
 * Page Details — metadata, SEO, publish status, audit timestamps. No
 * revisions/parent/children/author sections — none of those exist on the
 * `Page` model (see docs/70_FRONTEND_PAGES.md "Backend Limitations").
 * Publish appears only for a non-published, non-deleted page and requires
 * `page.manage` (the single permission gating every Pages action).
 */
export function PageDetailPageContent({ pageId }: PageDetailPageContentProps) {
  const router = useRouter();
  const { data: page, isLoading, error, refetch } = usePage(pageId);

  const deleteMutation = useDeletePage();
  const restoreMutation = useRestorePage();
  const publishMutation = usePublishPage();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

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

  if (!page) {
    return <EmptyState title="Page not found" />;
  }

  const canPublish = !page.deletedAt && page.status !== 'PUBLISHED';

  return (
    <div className="space-y-6">
      <PageHeader
        title={page.title}
        actions={
          <div className="flex flex-wrap gap-2">
            {page.deletedAt ? (
              <PermissionGate permissions={PERMISSIONS.PAGE_MANAGE}>
                <Button variant="outline" onClick={() => setRestoreOpen(true)}>
                  Restore
                </Button>
              </PermissionGate>
            ) : (
              <PermissionGate permissions={PERMISSIONS.PAGE_MANAGE}>
                <Button variant="outline" onClick={() => router.push(PAGE_ROUTES.edit(page.id))}>
                  Edit
                </Button>
                {canPublish ? (
                  <Button variant="outline" onClick={() => setPublishOpen(true)}>
                    Publish
                  </Button>
                ) : null}
                <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                  Delete
                </Button>
              </PermissionGate>
            )}
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <CardTitle>{page.title}</CardTitle>
          <StatusBadge status={page.status} />
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Slug</dt>
              <dd className="font-mono">{page.slug}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Published</dt>
              <dd>{page.publishedAt ? new Date(page.publishedAt).toLocaleString() : '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{new Date(page.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Updated</dt>
              <dd>{new Date(page.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent>
          {page.seo ? (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">SEO title</dt>
                <dd>{page.seo.title ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Canonical URL</dt>
                <dd className="break-all">{page.seo.canonicalUrl ?? '—'}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">SEO description</dt>
                <dd>{page.seo.description ?? '—'}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Keywords</dt>
                <dd>{page.seo.keywords?.length ? page.seo.keywords.join(', ') : '—'}</dd>
              </div>
            </dl>
          ) : (
            <EmptyState title="No SEO metadata set" />
          )}
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        pageTitle={page.title}
        onConfirm={() => deleteMutation.mutate(page.id)}
      />
      <RestoreDialog
        open={restoreOpen}
        onOpenChange={setRestoreOpen}
        pageTitle={page.title}
        onConfirm={() => restoreMutation.mutate(page.id)}
      />
      <PublishDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        pageTitle={page.title}
        onConfirm={() => publishMutation.mutate(page.id)}
      />
    </div>
  );
}
