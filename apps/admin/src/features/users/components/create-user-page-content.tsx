'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { useCreateUser } from '../hooks/use-create-user';
import { CreateUserForm } from './user-form';
import type { CreateUserFormValues } from '../schemas/create-user.schema';

export function CreateUserPageContent() {
  const router = useRouter();
  const createMutation = useCreateUser();

  function handleSubmit(values: CreateUserFormValues) {
    createMutation.mutate(
      {
        email: values.email,
        username: values.username || undefined,
        displayName: values.displayName || undefined,
        password: values.password || undefined,
      },
      { onSuccess: () => router.push(ROUTES.USERS) },
    );
  }

  const submitError = createMutation.isError
    ? isApiError(createMutation.error)
      ? createMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="max-w-lg space-y-6">
      <PageHeader title="New user" />
      <CreateUserForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} submitError={submitError} />
    </div>
  );
}
