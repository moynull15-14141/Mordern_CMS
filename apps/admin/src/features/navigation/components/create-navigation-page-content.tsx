'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { NAVIGATION_ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { useCreateMenu } from '../hooks/use-menu-mutations';
import { NavigationForm } from './navigation-form';
import type { CreateMenuFormValues } from '../schemas/create-menu.schema';

export function CreateNavigationPageContent() {
  const router = useRouter();
  const createMutation = useCreateMenu();

  function handleSubmit(values: CreateMenuFormValues) {
    createMutation.mutate(
      {
        name: values.name,
        slug: values.slug || undefined,
        location: values.location || undefined,
      },
      {
        onSuccess: (menu) => router.push(NAVIGATION_ROUTES.edit(menu.id)),
      }
    );
  }

  const submitError = createMutation.isError
    ? isApiError(createMutation.error)
      ? createMutation.error.message
      : 'Could not create this navigation menu.'
    : null;

  return (
    <div className="max-w-lg space-y-6">
      <PageHeader title="New navigation" />
      <NavigationForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        submitError={submitError}
      />
    </div>
  );
}
