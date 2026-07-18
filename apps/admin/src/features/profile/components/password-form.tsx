'use client';

import { useAppForm } from '@/hooks/use-app-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form/form';
import { FormSubmitButton } from '@/components/form/form-submit-button';
import { PasswordInput } from '@/components/ui/password-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { changePasswordSchema, type ChangePasswordFormValues } from '../schemas/change-password.schema';
import type { ChangePasswordInput } from '@/features/users';

export interface PasswordFormProps {
  onSubmit: (input: ChangePasswordInput) => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

/** Self-service `POST /users/:id/change-password` — `confirmPassword` is a
 * frontend-only field, stripped here before calling `onSubmit` (never part
 * of `ChangePasswordDto`). */
export function PasswordForm({ onSubmit, isSubmitting, submitError }: PasswordFormProps) {
  const form = useAppForm(changePasswordSchema, {
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  function handleSubmit(values: ChangePasswordFormValues) {
    onSubmit({ currentPassword: values.currentPassword, newPassword: values.newPassword });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
        {submitError ? (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}

        <Alert variant="info">
          <AlertDescription>Changing your password will log you out of every device.</AlertDescription>
        </Alert>

        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current password</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormSubmitButton isLoading={isSubmitting} disabled={isSubmitting}>
          Change password
        </FormSubmitButton>
      </form>
    </Form>
  );
}
