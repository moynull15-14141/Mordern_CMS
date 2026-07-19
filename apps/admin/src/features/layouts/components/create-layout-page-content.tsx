'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { LAYOUT_ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { useCreateLayout } from '../hooks/use-create-layout';
import { CreateLayoutForm } from './layout-form';
import type { CreateLayoutFormValues } from '../schemas/create-layout.schema';
import type { CreateLayoutInput } from '../types/layout';

function toCreateInput(values: CreateLayoutFormValues): CreateLayoutInput {
  return {
    name: values.name,
    slug: values.slug || undefined,
    layoutPreset: values.layoutPreset,
    themeId: values.themeId || undefined,
  };
}

/** No status choice — `CreateLayoutDto` has no `status` field, every
 * created layout starts DRAFT. */
export function CreateLayoutPageContent() {
  const router = useRouter();
  const createMutation = useCreateLayout();

  function handleSubmit(values: CreateLayoutFormValues) {
    createMutation.mutate(toCreateInput(values), {
      onSuccess: (layout) => router.push(LAYOUT_ROUTES.detail(layout.id)),
    });
  }

  const submitError = createMutation.isError
    ? isApiError(createMutation.error)
      ? createMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="space-y-6">
      <PageHeader title="New layout" />
      <CreateLayoutForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        submitError={submitError}
      />
    </div>
  );
}
