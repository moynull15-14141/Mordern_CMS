'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { useCreateRedirect } from '../hooks/use-redirect-mutations';
import { CreateRedirectForm } from './redirect-form';
import type { CreateRedirectFormValues } from '../schemas/redirect.schema';

export function CreateRedirectPageContent() {
  const router = useRouter();
  const createMutation = useCreateRedirect();

  function handleSubmit(values: CreateRedirectFormValues) {
    createMutation.mutate(values, { onSuccess: () => router.push(ROUTES.REDIRECTS) });
  }

  const submitError = createMutation.isError
    ? isApiError(createMutation.error)
      ? createMutation.error.message
      : 'Could not create this redirect.'
    : null;

  return (
    <div className="max-w-lg space-y-6">
      <PageHeader title="New redirect" />
      <CreateRedirectForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        submitError={submitError}
      />
    </div>
  );
}
