'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { REUSABLE_BLOCK_ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { useReusableBlock } from '../hooks/use-reusable-block';
import { useUpdateReusableBlock } from '../hooks/use-update-reusable-block';
import { EditReusableBlockForm } from './reusable-block-form';
import type { UpdateReusableBlockFormValues } from '../schemas/update-reusable-block.schema';
import type { ReusableBlock, UpdateReusableBlockInput } from '../types/reusable-block';

function toFormDefaults(block: ReusableBlock): UpdateReusableBlockFormValues {
  return {
    name: block.name,
    description: block.description ?? '',
    category: block.category ?? '',
    blocks: [
      {
        id: block.id,
        type: block.blockType,
        data: block.data,
        children: block.children ?? undefined,
      },
    ],
  };
}

function toUpdateInput(values: UpdateReusableBlockFormValues): UpdateReusableBlockInput {
  const [block] = values.blocks;
  return {
    name: values.name,
    description: values.description || undefined,
    category: values.category || undefined,
    data: block.data,
    children: block.children,
  };
}

export interface EditReusableBlockPageContentProps {
  blockId: string;
}

/** Pessimistic update (mirrors `EditThemePageContent`) + a cancel/navigate-
 * away dirty-tracking warning. */
export function EditReusableBlockPageContent({ blockId }: EditReusableBlockPageContentProps) {
  const router = useRouter();
  const { data: block, isLoading, error } = useReusableBlock(blockId);
  const updateMutation = useUpdateReusableBlock(blockId);
  const [isDirty, setIsDirty] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  function handleSubmit(values: UpdateReusableBlockFormValues) {
    updateMutation.mutate(toUpdateInput(values), {
      onSuccess: () => router.push(REUSABLE_BLOCK_ROUTES.detail(blockId)),
    });
  }

  function handleCancel() {
    if (isDirty) {
      setCancelConfirmOpen(true);
      return;
    }
    router.push(REUSABLE_BLOCK_ROUTES.detail(blockId));
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !block) {
    return <ErrorState error={error} />;
  }

  const submitError = updateMutation.isError
    ? isApiError(updateMutation.error)
      ? updateMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title={`Edit ${block.name}`} />

      <EditReusableBlockForm
        defaultValues={toFormDefaults(block)}
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
        onConfirm={() => router.push(REUSABLE_BLOCK_ROUTES.detail(blockId))}
      />
    </div>
  );
}
