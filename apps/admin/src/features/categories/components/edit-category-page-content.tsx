'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { CATEGORY_ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { useCategory } from '../hooks/use-category';
import { useUpdateCategory } from '../hooks/use-update-category';
import { EditCategoryForm } from './category-form';
import type { UpdateCategoryFormValues } from '../schemas/update-category.schema';
import type { Category, UpdateCategoryInput } from '../types/category';

function toFormDefaults(category: Category): UpdateCategoryFormValues {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? '',
    status: category.status,
    sortOrder: category.sortOrder ?? '',
    seo: {
      title: category.seo?.title ?? '',
      description: category.seo?.description ?? '',
      canonicalUrl: category.seo?.canonicalUrl ?? '',
      keywords: category.seo?.keywords?.join(', ') ?? '',
    },
  };
}

function toUpdateInput(values: UpdateCategoryFormValues): UpdateCategoryInput {
  const keywords = values.seo?.keywords
    ? values.seo.keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean)
    : undefined;
  const hasSeo = Boolean(values.seo?.title || values.seo?.description || values.seo?.canonicalUrl || keywords?.length);

  return {
    name: values.name,
    slug: values.slug || undefined,
    description: values.description || undefined,
    status: values.status,
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

export interface EditCategoryPageContentProps {
  categoryId: string;
}

/** Pessimistic update (mirrors `EditArticlePageContent`) + dirty-tracking
 * cancel confirmation. No parent field — parent changes happen only via
 * the Move dialog on the Detail page. */
export function EditCategoryPageContent({ categoryId }: EditCategoryPageContentProps) {
  const router = useRouter();
  const { data: category, isLoading, error } = useCategory(categoryId);
  const updateMutation = useUpdateCategory(categoryId);
  const [isDirty, setIsDirty] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  function handleSubmit(values: UpdateCategoryFormValues) {
    updateMutation.mutate(toUpdateInput(values), {
      onSuccess: () => router.push(CATEGORY_ROUTES.detail(categoryId)),
    });
  }

  function handleCancel() {
    if (isDirty) {
      setCancelConfirmOpen(true);
      return;
    }
    router.push(CATEGORY_ROUTES.detail(categoryId));
  }

  if (isLoading) {
    return (
      <div className="max-w-xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !category) {
    return <ErrorState error={error} />;
  }

  const submitError = updateMutation.isError
    ? isApiError(updateMutation.error)
      ? updateMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="max-w-xl space-y-6">
      <PageHeader title={`Edit ${category.name}`} />

      <EditCategoryForm
        defaultValues={toFormDefaults(category)}
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
        onConfirm={() => router.push(CATEGORY_ROUTES.detail(categoryId))}
      />
    </div>
  );
}
