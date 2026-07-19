'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PermissionGate } from '@/components/guards/permission-gate';
import { PERMISSIONS } from '@/constants/permissions';
import { useLayoutAssignments } from '../hooks/use-layout-assignments';
import { useUnassignLayout } from '../hooks/use-unassign-layout';
import { AssignmentsTable } from './assignments-table';
import { AssignLayoutDialog } from './assign-layout-dialog';
import { CONTENT_TYPE_OPTIONS } from '../constants/layout-assignment.constants';
import type { LayoutAssignment, LayoutAssignmentContentType } from '../types/layout-assignment';

const ALL_VALUE = '__all__';

/** Layout Assignments — the global view of every `LayoutAssignment`
 * (Homepage/Page/Article/Category), independent of any one Layout's own
 * Detail page. `contentType` filter maps directly onto the real
 * `GET /layout-assignments?contentType=` query param. */
export function AssignmentsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contentType =
    (searchParams.get('contentType') as LayoutAssignmentContentType | null) ?? undefined;

  const { data, isLoading, error, refetch } = useLayoutAssignments(contentType);
  const unassignMutation = useUnassignLayout();

  const [assignOpen, setAssignOpen] = useState(false);
  const [toUnassign, setToUnassign] = useState<LayoutAssignment | null>(null);

  function updateContentType(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === ALL_VALUE) {
      params.delete('contentType');
    } else {
      params.set('contentType', next);
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Layout Assignments"
        actions={
          <PermissionGate permissions={PERMISSIONS.LAYOUT_MANAGE}>
            <Button onClick={() => setAssignOpen(true)}>Assign layout</Button>
          </PermissionGate>
        }
      />

      <div className="space-y-1">
        <Label htmlFor="assignment-filter-content-type">Content type</Label>
        <Select value={contentType ?? ALL_VALUE} onValueChange={updateContentType}>
          <SelectTrigger id="assignment-filter-content-type" className="w-48">
            <SelectValue placeholder="All content types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>All content types</SelectItem>
            {CONTENT_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AssignmentsTable
        data={data ?? []}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        onUnassign={setToUnassign}
      />

      <AssignLayoutDialog open={assignOpen} onOpenChange={setAssignOpen} />

      <ConfirmDialog
        open={Boolean(toUnassign)}
        onOpenChange={(open) => !open && setToUnassign(null)}
        title="Unassign layout"
        description="Unassign this layout? The target will fall back to the next tier in the priority chain (content default, theme default, or system default)."
        confirmLabel="Unassign"
        variant="destructive"
        onConfirm={() => {
          if (toUnassign) unassignMutation.mutate(toUnassign.id);
        }}
      />
    </div>
  );
}
