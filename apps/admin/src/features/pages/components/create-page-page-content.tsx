'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { PAGE_ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { useCreatePage } from '../hooks/use-create-page';
import { CreatePageForm } from './page-form';
import type { CreatePageFormValues } from '../schemas/create-page.schema';
import type { CreatePageInput } from '../types/page';

function toCreateInput(values: CreatePageFormValues): CreatePageInput {
  const keywords = values.seo?.keywords
    ? values.seo.keywords
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean)
    : undefined;
  const hasSeo = Boolean(
    values.seo?.title || values.seo?.description || values.seo?.canonicalUrl || keywords?.length
  );

  return {
    title: values.title,
    slug: values.slug || undefined,
    body: { text: values.bodyText },
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

/** No "Publish"/"Save Draft" choice here — `CreatePageDto` has no `status`
 * field, so every created page starts in the backend's own default status.
 * Publish is a separate action on the Detail page after creation. */
export function CreatePagePageContent() {
  const router = useRouter();
  const createMutation = useCreatePage();

  function handleSubmit(values: CreatePageFormValues) {
    createMutation.mutate(toCreateInput(values), {
      onSuccess: (page) => router.push(PAGE_ROUTES.detail(page.id)),
    });
  }

  const submitError = createMutation.isError
    ? isApiError(createMutation.error)
      ? createMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="New page" />
      <CreatePageForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        submitError={submitError}
      />
    </div>
  );
}
