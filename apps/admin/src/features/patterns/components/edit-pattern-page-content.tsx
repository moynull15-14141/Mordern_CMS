'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { PATTERN_ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { usePattern } from '../hooks/use-patterns';
import { useUpdatePattern } from '../hooks/use-pattern-mutations';
import { EditPatternForm } from './pattern-form';
import type { UpdatePatternFormValues } from '../schemas/update-pattern.schema';
import type { Pattern, UpdatePatternInput } from '../types/pattern';

function toFormDefaults(pattern: Pattern): UpdatePatternFormValues {
  return {
    name: pattern.name,
    description: pattern.description ?? '',
    category: pattern.category ?? '',
    tags: pattern.tags.join(', '),
    blocks: pattern.body.blocks,
  };
}

function toUpdateInput(values: UpdatePatternFormValues): UpdatePatternInput {
  return {
    name: values.name,
    description: values.description || undefined,
    category: values.category || undefined,
    tags: values.tags
      ? values.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],
    body: { blocks: values.blocks },
  };
}

export interface EditPatternPageContentProps {
  patternId: string;
}

/** Edit Pattern — pre-loads the Block Editor with the pattern's own body.
 * Pessimistic update + dirty-tracking cancel confirm, mirrors
 * `EditReusableBlockPageContent` exactly. Editing a pattern here never
 * touches any page/article that previously inserted a detached copy of
 * it — there is no live link to walk. */
export function EditPatternPageContent({ patternId }: EditPatternPageContentProps) {
  const router = useRouter();
  const { data: pattern, isLoading, error } = usePattern(patternId);
  const updateMutation = useUpdatePattern(patternId);
  const [isDirty, setIsDirty] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  function handleSubmit(values: UpdatePatternFormValues) {
    updateMutation.mutate(toUpdateInput(values), {
      onSuccess: () => router.push(PATTERN_ROUTES.detail(patternId)),
    });
  }

  function handleCancel() {
    if (isDirty) {
      setCancelConfirmOpen(true);
      return;
    }
    router.push(PATTERN_ROUTES.detail(patternId));
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !pattern) {
    return <ErrorState error={error} />;
  }

  const submitError = updateMutation.isError
    ? isApiError(updateMutation.error)
      ? updateMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title={`Edit ${pattern.name}`} />

      <EditPatternForm
        defaultValues={toFormDefaults(pattern)}
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
        onConfirm={() => router.push(PATTERN_ROUTES.detail(patternId))}
      />
    </div>
  );
}
