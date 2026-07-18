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
import { TAG_ROUTES } from '@/constants/routes';
import { useTag } from '../hooks/use-tag';
import { useDeleteTag } from '../hooks/use-delete-tag';
import { useRestoreTag } from '../hooks/use-restore-tag';
import { DeleteDialog } from './delete-dialog';
import { RestoreDialog } from './restore-dialog';

export interface TagDetailPageContentProps {
  tagId: string;
}

/** Tag Details — read-only metadata. No SEO section — `TagResponseDto` has
 * no `seo` field (see docs/66_FRONTEND_CATEGORIES_TAGS.md "Known
 * Limitations"). */
export function TagDetailPageContent({ tagId }: TagDetailPageContentProps) {
  const router = useRouter();
  const { data: tag, isLoading, error, refetch } = useTag(tagId);

  const deleteMutation = useDeleteTag();
  const restoreMutation = useRestoreTag();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  if (!tag) {
    return <EmptyState title="Tag not found" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={tag.name}
        actions={
          <div className="flex flex-wrap gap-2">
            {tag.deletedAt ? (
              <PermissionGate permissions={PERMISSIONS.CATEGORY_CREATE}>
                <Button variant="outline" onClick={() => setRestoreOpen(true)}>
                  Restore
                </Button>
              </PermissionGate>
            ) : (
              <PermissionGate permissions={PERMISSIONS.CATEGORY_CREATE}>
                <Button variant="outline" onClick={() => router.push(TAG_ROUTES.edit(tag.id))}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                  Delete
                </Button>
              </PermissionGate>
            )}
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{tag.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Slug</dt>
              <dd className="font-mono">{tag.slug}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Used by</dt>
              <dd>
                {tag.usageCount} article{tag.usageCount === 1 ? '' : 's'}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground">Synonyms</dt>
              <dd>{tag.synonyms?.length ? tag.synonyms.join(', ') : '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Updated</dt>
              <dd>{new Date(tag.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
          {tag.description ? (
            <div className="mt-4">
              <dt className="text-sm text-muted-foreground">Description</dt>
              <dd className="text-sm">{tag.description}</dd>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        tagName={tag.name}
        onConfirm={() => deleteMutation.mutate(tag.id)}
      />
      <RestoreDialog
        open={restoreOpen}
        onOpenChange={setRestoreOpen}
        tagName={tag.name}
        onConfirm={() => restoreMutation.mutate(tag.id)}
      />
    </div>
  );
}
