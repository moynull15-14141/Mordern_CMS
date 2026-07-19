'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { LAYOUT_ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { useLayout } from '../hooks/use-layout';
import { useUpdateLayout } from '../hooks/use-update-layout';
import { EditLayoutForm } from './layout-form';
import type { UpdateLayoutFormValues } from '../schemas/update-layout.schema';
import type { Layout, UpdateLayoutInput } from '../types/layout';

function toFormDefaults(layout: Layout): UpdateLayoutFormValues {
  return {
    name: layout.name,
    slug: layout.slug,
    layoutPreset: layout.layoutPreset,
    themeId: layout.themeId ?? '',
    status: layout.status,
  };
}

function toUpdateInput(values: UpdateLayoutFormValues): UpdateLayoutInput {
  return {
    name: values.name,
    slug: values.slug,
    layoutPreset: values.layoutPreset,
    themeId: values.themeId || null,
    status: values.status,
  };
}

export interface EditLayoutPageContentProps {
  layoutId: string;
}

/** Pessimistic update (mirrors `EditThemePageContent`) + a cancel/navigate-
 * away dirty-tracking warning. */
export function EditLayoutPageContent({ layoutId }: EditLayoutPageContentProps) {
  const router = useRouter();
  const { data: layout, isLoading, error } = useLayout(layoutId);
  const updateMutation = useUpdateLayout(layoutId);
  const [isDirty, setIsDirty] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  function handleSubmit(values: UpdateLayoutFormValues) {
    updateMutation.mutate(toUpdateInput(values), {
      onSuccess: () => router.push(LAYOUT_ROUTES.detail(layoutId)),
    });
  }

  function handleCancel() {
    if (isDirty) {
      setCancelConfirmOpen(true);
      return;
    }
    router.push(LAYOUT_ROUTES.detail(layoutId));
  }

  if (isLoading) {
    return (
      <div className="max-w-xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !layout) {
    return <ErrorState error={error} />;
  }

  const submitError = updateMutation.isError
    ? isApiError(updateMutation.error)
      ? updateMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit ${layout.name}`} />

      <EditLayoutForm
        defaultValues={toFormDefaults(layout)}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        submitError={submitError}
        onDirtyChange={setIsDirty}
      />

      <button
        type="button"
        onClick={handleCancel}
        className="text-sm text-muted-foreground hover:underline"
      >
        Cancel
      </button>

      <ConfirmDialog
        open={cancelConfirmOpen}
        onOpenChange={setCancelConfirmOpen}
        title="Discard changes?"
        description="You have unsaved changes. Are you sure you want to leave without saving?"
        confirmLabel="Discard"
        variant="destructive"
        onConfirm={() => router.push(LAYOUT_ROUTES.detail(layoutId))}
      />
    </div>
  );
}
