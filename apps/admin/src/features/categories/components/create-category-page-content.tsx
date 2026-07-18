'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { CATEGORY_ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { useCreateCategory } from '../hooks/use-create-category';
import { CreateCategoryForm } from './category-form';
import type { CreateCategoryFormValues } from '../schemas/create-category.schema';
import type { CreateCategoryInput } from '../types/category';

function toCreateInput(values: CreateCategoryFormValues): CreateCategoryInput {
  const keywords = values.seo?.keywords
    ? values.seo.keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean)
    : undefined;
  const hasSeo = Boolean(values.seo?.title || values.seo?.description || values.seo?.canonicalUrl || keywords?.length);

  return {
    name: values.name,
    slug: values.slug || undefined,
    description: values.description || undefined,
    parentId: values.parentId || undefined,
    sortOrder: values.sortOrder === '' || values.sortOrder === undefined ? undefined : Number(values.sortOrder),
    seo: hasSeo
      ? {
          title: values.seo?.title || undefined,
          description: values.seo?.description || undefined,
          canonicalUrl: values.seo?.canonicalUrl || undefined,
          keywords,
        }
      : undefined,
  };
}

export function CreateCategoryPageContent() {
  const router = useRouter();
  const createMutation = useCreateCategory();

  function handleSubmit(values: CreateCategoryFormValues) {
    createMutation.mutate(toCreateInput(values), {
      onSuccess: (category) => router.push(CATEGORY_ROUTES.detail(category.id)),
    });
  }

  const submitError = createMutation.isError
    ? isApiError(createMutation.error)
      ? createMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="max-w-xl space-y-6">
      <PageHeader title="New category" />
      <CreateCategoryForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} submitError={submitError} />
    </div>
  );
}
