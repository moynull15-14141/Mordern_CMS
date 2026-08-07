'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { PATTERN_ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { useCreatePattern } from '../hooks/use-pattern-mutations';
import { CreatePatternForm } from './pattern-form';
import type { CreatePatternFormValues } from '../schemas/create-pattern.schema';
import type { CreatePatternInput } from '../types/pattern';

function toCreateInput(values: CreatePatternFormValues): CreatePatternInput {
  return {
    name: values.name,
    description: values.description || undefined,
    category: values.category || undefined,
    tags: values.tags
      ? values.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : undefined,
    body: { blocks: values.blocks },
  };
}

/** Create Pattern — Name/Description/Category/Tags → Block Editor → Save
 * (Milestone 6 spec's "Pattern creation" flow). Reuses the exact same
 * embedded Block Editor every other create page uses; nothing new to
 * build here beyond the form's own field list. */
export function CreatePatternPageContent() {
  const router = useRouter();
  const createMutation = useCreatePattern();

  function handleSubmit(values: CreatePatternFormValues) {
    createMutation.mutate(toCreateInput(values), {
      onSuccess: (created) => router.push(PATTERN_ROUTES.detail(created.id)),
    });
  }

  const submitError = createMutation.isError
    ? isApiError(createMutation.error)
      ? createMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title="New pattern" />
      <CreatePatternForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        submitError={submitError}
      />
    </div>
  );
}
