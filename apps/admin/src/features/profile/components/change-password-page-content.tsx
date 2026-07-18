'use client';

import { PageHeader } from '@/components/layout/page-header';
import { isApiError } from '@/lib/api-error';
import { useChangePassword } from '../hooks/use-change-password';
import { PasswordForm } from './password-form';

/** `useChangePassword` logs the caller out on success (their own sessions
 * are revoked server-side) — see the hook's own doc comment. */
export function ChangePasswordPageContent() {
  const changePasswordMutation = useChangePassword();

  const submitError = changePasswordMutation.isError
    ? isApiError(changePasswordMutation.error)
      ? changePasswordMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <div className="max-w-lg space-y-6">
      <PageHeader title="Change password" />
      <PasswordForm
        onSubmit={(input) => changePasswordMutation.mutate(input)}
        isSubmitting={changePasswordMutation.isPending}
        submitError={submitError}
      />
    </div>
  );
}
