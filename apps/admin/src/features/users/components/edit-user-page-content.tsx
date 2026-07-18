'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { USER_ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { useUser } from '../hooks/use-user';
import { useUpdateUser } from '../hooks/use-update-user';
import { EditUserForm } from './user-form';
import type { UpdateUserFormValues } from '../schemas/update-user.schema';

export interface EditUserPageContentProps {
  userId: string;
}

/** Pessimistic update (approved decision 5) + a cancel/navigate-away
 * dirty-tracking warning (`EditUserForm`'s `onDirtyChange`). No status/role
 * field — `UpdateUserDto` has none (docs/63_FRONTEND_USERS.md). */
export function EditUserPageContent({ userId }: EditUserPageContentProps) {
  const router = useRouter();
  const { data: targetUser, isLoading, error } = useUser(userId);
  const updateMutation = useUpdateUser(userId);
  const [isDirty, setIsDirty] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  function handleSubmit(values: UpdateUserFormValues) {
    updateMutation.mutate(
      { username: values.username || undefined, displayName: values.displayName || undefined },
      { onSuccess: () => router.push(USER_ROUTES.detail(userId)) },
    );
  }

  function handleCancel() {
    if (isDirty) {
      setCancelConfirmOpen(true);
      return;
    }
    router.push(USER_ROUTES.detail(userId));
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full max-w-lg" />
      </div>
    );
  }

  if (error || !targetUser) {
    return <ErrorState error={error} />;
  }

  const submitError = updateMutation.isError
    ? isApiError(updateMutation.error)
      ? updateMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="max-w-lg space-y-6">
      <PageHeader title={`Edit ${targetUser.displayName ?? targetUser.email}`} />

      <EditUserForm
        defaultValues={{ username: targetUser.username ?? '', displayName: targetUser.displayName ?? '' }}
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
        onConfirm={() => router.push(USER_ROUTES.detail(userId))}
      />
    </div>
  );
}
