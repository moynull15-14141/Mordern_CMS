'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { PermissionGate } from '@/components/guards/permission-gate';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { EmptyState } from '@/components/feedback/empty-state';
import { PERMISSIONS } from '@/constants/permissions';
import { REUSABLE_BLOCK_ROUTES } from '@/constants/routes';
import { getBlockDefinition } from '@/features/block-editor';
import { useReusableBlock } from '../hooks/use-reusable-block';
import { useReusableBlockUsages } from '../hooks/use-reusable-block-usages';
import { useDeleteReusableBlock } from '../hooks/use-delete-reusable-block';
import { useRestoreReusableBlock } from '../hooks/use-restore-reusable-block';
import { useDuplicateReusableBlock } from '../hooks/use-duplicate-reusable-block';
import { DeleteDialog } from './delete-dialog';
import { RestoreDialog } from './restore-dialog';
import { DuplicateDialog } from './duplicate-dialog';
import { ReusableBlockPreview } from './reusable-block-preview';
import { UsageList } from './usage-list';

export interface ReusableBlockDetailPageContentProps {
  blockId: string;
}

/**
 * Reusable Block Inspector — Name, Description, Created, Updated, Used By,
 * Preview, Status (spec §4), plus Category/Type for context and
 * Edit/Duplicate/Delete/Restore actions (spec §1/§6). Usage is fetched
 * lazily here (`useReusableBlockUsages`), only once the block itself has
 * loaded — never from the list page, per the performance requirement.
 */
export function ReusableBlockDetailPageContent({ blockId }: ReusableBlockDetailPageContentProps) {
  const router = useRouter();
  const { data: block, isLoading, error, refetch } = useReusableBlock(blockId);
  const { data: usages, isLoading: usagesLoading } = useReusableBlockUsages(blockId);

  const deleteMutation = useDeleteReusableBlock();
  const restoreMutation = useRestoreReusableBlock();
  const duplicateMutation = useDuplicateReusableBlock();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);

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

  if (!block) {
    return <EmptyState title="Reusable block not found" />;
  }

  const definition = getBlockDefinition(block.blockType);

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title={block.name}
        actions={
          <div className="flex flex-wrap gap-2">
            {block.deletedAt ? (
              <PermissionGate permissions={PERMISSIONS.PAGE_MANAGE}>
                <Button variant="outline" onClick={() => setRestoreOpen(true)}>
                  Restore
                </Button>
              </PermissionGate>
            ) : (
              <PermissionGate permissions={PERMISSIONS.PAGE_MANAGE}>
                <Button
                  variant="outline"
                  onClick={() => router.push(REUSABLE_BLOCK_ROUTES.edit(block.id))}
                >
                  Edit
                </Button>
                <Button variant="outline" onClick={() => setDuplicateOpen(true)}>
                  Duplicate
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
        <CardHeader className="flex flex-row items-center gap-3">
          <CardTitle>{block.name}</CardTitle>
          <Badge variant={block.deletedAt ? 'outline' : 'success'}>
            {block.deletedAt ? 'Deleted' : 'Active'}
          </Badge>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Type</dt>
              <dd>{definition?.label ?? block.blockType}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Category</dt>
              <dd>{block.category ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{new Date(block.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Updated</dt>
              <dd>{new Date(block.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
          {block.description ? (
            <div className="mt-4">
              <dt className="text-sm text-muted-foreground">Description</dt>
              <dd className="text-sm">{block.description}</dd>
            </div>
          ) : null}
          <div className="mt-4">
            <dt className="mb-1 text-sm text-muted-foreground">Preview</dt>
            <ReusableBlockPreview block={block} className="text-sm" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Used By</CardTitle>
        </CardHeader>
        <CardContent>
          {usagesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : usages && usages.length > 0 ? (
            <UsageList usages={usages} />
          ) : (
            <p className="text-sm text-muted-foreground">Not used anywhere yet.</p>
          )}
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        block={block}
        onConfirm={() => deleteMutation.mutate(block.id)}
      />
      <RestoreDialog
        open={restoreOpen}
        onOpenChange={setRestoreOpen}
        blockName={block.name}
        onConfirm={() => restoreMutation.mutate(block.id)}
      />
      <DuplicateDialog
        open={duplicateOpen}
        onOpenChange={setDuplicateOpen}
        block={block}
        isSubmitting={duplicateMutation.isPending}
        onSubmit={(name) => {
          duplicateMutation.mutate(
            { source: block, name },
            {
              onSuccess: (created) => {
                setDuplicateOpen(false);
                router.push(REUSABLE_BLOCK_ROUTES.detail(created.id));
              },
            }
          );
        }}
      />
    </div>
  );
}
