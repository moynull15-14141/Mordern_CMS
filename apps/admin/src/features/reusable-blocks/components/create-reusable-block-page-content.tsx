'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { REUSABLE_BLOCK_ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { useCreateReusableBlock } from '../hooks/use-create-reusable-block';
import { CreateReusableBlockForm } from './reusable-block-form';
import type { CreateReusableBlockFormValues } from '../schemas/create-reusable-block.schema';
import type { CreateReusableBlockInput } from '../types/reusable-block';

function toCreateInput(values: CreateReusableBlockFormValues): CreateReusableBlockInput {
  const [block] = values.blocks;
  return {
    name: values.name,
    description: values.description || undefined,
    category: values.category || undefined,
    blockType: block.type,
    data: block.data,
    children: block.children,
  };
}

export function CreateReusableBlockPageContent() {
  const router = useRouter();
  const createMutation = useCreateReusableBlock();

  function handleSubmit(values: CreateReusableBlockFormValues) {
    createMutation.mutate(toCreateInput(values), {
      onSuccess: (block) => router.push(REUSABLE_BLOCK_ROUTES.detail(block.id)),
    });
  }

  const submitError = createMutation.isError
    ? isApiError(createMutation.error)
      ? createMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title="New reusable block" />
      <CreateReusableBlockForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        submitError={submitError}
      />
    </div>
  );
}
