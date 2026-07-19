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
import { LAYOUT_ROUTES } from '@/constants/routes';
import { useLayout } from '../hooks/use-layout';
import { useDeleteLayout } from '../hooks/use-delete-layout';
import { useRestoreLayout } from '../hooks/use-restore-layout';
import { useLayoutAssignments } from '../hooks/use-layout-assignments';
import { useUnassignLayout } from '../hooks/use-unassign-layout';
import { StatusBadge } from './status-badge';
import { DeleteDialog } from './delete-dialog';
import { RestoreDialog } from './restore-dialog';
import { AssignLayoutDialog } from './assign-layout-dialog';
import { AssignmentsTable } from './assignments-table';
import { PRESET_LABELS } from '../constants/layout.constants';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import type { LayoutPresetName } from '../types/layout';
import type { LayoutAssignment } from '../types/layout-assignment';

export interface LayoutDetailPageContentProps {
  layoutId: string;
}

/**
 * Layout Details — metadata, status, theme compatibility, and every
 * `LayoutAssignment` currently pointing at this Layout (filtered
 * client-side from the global list — no `layoutId` filter exists on
 * `GET /layout-assignments`, only `contentType`; assignment counts are
 * expected to stay small).
 */
export function LayoutDetailPageContent({ layoutId }: LayoutDetailPageContentProps) {
  const router = useRouter();
  const { data: layout, isLoading, error, refetch } = useLayout(layoutId);

  const deleteMutation = useDeleteLayout();
  const restoreMutation = useRestoreLayout();
  const unassignMutation = useUnassignLayout();

  const assignmentsQuery = useLayoutAssignments();
  const assignmentsForLayout = (assignmentsQuery.data ?? []).filter((a) => a.layoutId === layoutId);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [toUnassign, setToUnassign] = useState<LayoutAssignment | null>(null);

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

  if (!layout) {
    return <EmptyState title="Layout not found" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={layout.name}
        actions={
          <div className="flex flex-wrap gap-2">
            {layout.deletedAt ? (
              <PermissionGate permissions={PERMISSIONS.LAYOUT_MANAGE}>
                <Button variant="outline" onClick={() => setRestoreOpen(true)}>
                  Restore
                </Button>
              </PermissionGate>
            ) : (
              <PermissionGate permissions={PERMISSIONS.LAYOUT_MANAGE}>
                <Button
                  variant="outline"
                  onClick={() => router.push(LAYOUT_ROUTES.edit(layout.id))}
                >
                  Edit
                </Button>
                <Button variant="outline" onClick={() => setAssignOpen(true)}>
                  Assign to…
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
          <CardTitle>{layout.name}</CardTitle>
          <StatusBadge status={layout.status} />
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Slug</dt>
              <dd className="font-mono">{layout.slug}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Layout preset</dt>
              <dd>
                {PRESET_LABELS[layout.layoutPreset as LayoutPresetName] ?? layout.layoutPreset}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Theme compatibility</dt>
              <dd>{layout.themeId ? layout.themeId : 'Any theme'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{new Date(layout.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last updated</dt>
              <dd>{new Date(layout.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Assigned to</h2>
        <AssignmentsTable
          data={assignmentsForLayout}
          isLoading={assignmentsQuery.isLoading}
          error={assignmentsQuery.error}
          onRetry={() => assignmentsQuery.refetch()}
          onUnassign={setToUnassign}
        />
      </div>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        layoutName={layout.name}
        onConfirm={() => deleteMutation.mutate(layout.id)}
      />
      <RestoreDialog
        open={restoreOpen}
        onOpenChange={setRestoreOpen}
        layoutName={layout.name}
        onConfirm={() => restoreMutation.mutate(layout.id)}
      />
      <AssignLayoutDialog open={assignOpen} onOpenChange={setAssignOpen} layoutId={layout.id} />
      <ConfirmDialog
        open={Boolean(toUnassign)}
        onOpenChange={(open) => !open && setToUnassign(null)}
        title="Unassign layout"
        description="Unassign this layout from that target?"
        confirmLabel="Unassign"
        variant="destructive"
        onConfirm={() => {
          if (toUnassign) unassignMutation.mutate(toUnassign.id);
        }}
      />
    </div>
  );
}
