'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { useRedirect } from '../hooks/use-redirects';
import { useUpdateRedirect } from '../hooks/use-redirect-mutations';
import { EditRedirectForm } from './redirect-form';
import type { UpdateRedirectFormValues } from '../schemas/redirect.schema';

export interface EditRedirectPageContentProps {
  redirectId: string;
}

export function EditRedirectPageContent({ redirectId }: EditRedirectPageContentProps) {
  const router = useRouter();
  const redirectQuery = useRedirect(redirectId);
  const updateMutation = useUpdateRedirect(redirectId);

  if (redirectQuery.isLoading) {
    return (
      <div className="max-w-lg space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (redirectQuery.error || !redirectQuery.data) {
    return <ErrorState error={redirectQuery.error} onRetry={() => redirectQuery.refetch()} />;
  }

  const redirect = redirectQuery.data;

  function handleSubmit(values: UpdateRedirectFormValues) {
    updateMutation.mutate(values, { onSuccess: () => router.push(ROUTES.REDIRECTS) });
  }

  const submitError = updateMutation.isError
    ? isApiError(updateMutation.error)
      ? updateMutation.error.message
      : 'Could not save this redirect.'
    : null;

  return (
    <div className="max-w-lg space-y-6">
      <PageHeader title={`Edit redirect: ${redirect.sourcePath}`} />
      <EditRedirectForm
        defaultValues={{
          sourcePath: redirect.sourcePath,
          destinationUrl: redirect.destinationUrl,
          redirectType: redirect.redirectType as 301 | 302,
          status: redirect.status,
        }}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        submitError={submitError}
      />
    </div>
  );
}
