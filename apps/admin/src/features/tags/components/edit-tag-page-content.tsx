'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { TAG_ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { useTag } from '../hooks/use-tag';
import { useUpdateTag } from '../hooks/use-update-tag';
import { EditTagForm } from './tag-form';
import type { UpdateTagFormValues } from '../schemas/update-tag.schema';
import type { Tag, UpdateTagInput } from '../types/tag';

function toFormDefaults(tag: Tag): UpdateTagFormValues {
  return {
    name: tag.name,
    slug: tag.slug,
    description: tag.description ?? '',
    synonyms: tag.synonyms?.join(', ') ?? '',
  };
}

function toUpdateInput(values: UpdateTagFormValues): UpdateTagInput {
  return {
    name: values.name,
    slug: values.slug || undefined,
    description: values.description || undefined,
    synonyms: values.synonyms
      ? values.synonyms.split(',').map((synonym) => synonym.trim()).filter(Boolean)
      : undefined,
  };
}

export interface EditTagPageContentProps {
  tagId: string;
}

/** Pessimistic update + dirty-tracking cancel confirmation, mirroring
 * `EditCategoryPageContent`. */
export function EditTagPageContent({ tagId }: EditTagPageContentProps) {
  const router = useRouter();
  const { data: tag, isLoading, error } = useTag(tagId);
  const updateMutation = useUpdateTag(tagId);
  const [isDirty, setIsDirty] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  function handleSubmit(values: UpdateTagFormValues) {
    updateMutation.mutate(toUpdateInput(values), {
      onSuccess: () => router.push(TAG_ROUTES.detail(tagId)),
    });
  }

  function handleCancel() {
    if (isDirty) {
      setCancelConfirmOpen(true);
      return;
    }
    router.push(TAG_ROUTES.detail(tagId));
  }

  if (isLoading) {
    return (
      <div className="max-w-lg space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !tag) {
    return <ErrorState error={error} />;
  }

  const submitError = updateMutation.isError
    ? isApiError(updateMutation.error)
      ? updateMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="max-w-lg space-y-6">
      <PageHeader title={`Edit ${tag.name}`} />

      <EditTagForm
        defaultValues={toFormDefaults(tag)}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        submitError={submitError}
        onDirtyChange={setIsDirty}
      />

      <button type="button" onClick={handleCancel} className="text-sm text-muted-foreground hover:underline">
        Cancel
      </button>

      <ConfirmDialog
        open={cancelConfirmOpen}
        onOpenChange={setCancelConfirmOpen}
        title="Discard changes?"
        description="You have unsaved changes. Are you sure you want to leave without saving?"
        confirmLabel="Discard"
        variant="destructive"
        onConfirm={() => router.push(TAG_ROUTES.detail(tagId))}
      />
    </div>
  );
}
