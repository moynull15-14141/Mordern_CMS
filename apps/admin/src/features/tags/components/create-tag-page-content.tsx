'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { TAG_ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { useCreateTag } from '../hooks/use-create-tag';
import { CreateTagForm } from './tag-form';
import type { CreateTagFormValues } from '../schemas/create-tag.schema';
import type { CreateTagInput } from '../types/tag';

function toCreateInput(values: CreateTagFormValues): CreateTagInput {
  return {
    name: values.name,
    slug: values.slug || undefined,
    description: values.description || undefined,
    synonyms: values.synonyms
      ? values.synonyms.split(',').map((synonym) => synonym.trim()).filter(Boolean)
      : undefined,
  };
}

export function CreateTagPageContent() {
  const router = useRouter();
  const createMutation = useCreateTag();

  function handleSubmit(values: CreateTagFormValues) {
    createMutation.mutate(toCreateInput(values), {
      onSuccess: (tag) => router.push(TAG_ROUTES.detail(tag.id)),
    });
  }

  const submitError = createMutation.isError
    ? isApiError(createMutation.error)
      ? createMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="max-w-lg space-y-6">
      <PageHeader title="New tag" />
      <CreateTagForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} submitError={submitError} />
    </div>
  );
}
