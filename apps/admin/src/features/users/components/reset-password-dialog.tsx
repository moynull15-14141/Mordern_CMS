'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppForm } from '@/hooks/use-app-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form/form';
import { FormSubmitButton } from '@/components/form/form-submit-button';
import { PasswordInput } from '@/components/ui/password-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas/reset-password.schema';
import type { AdminResetPasswordInput } from '../types/user';

export interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userLabel: string;
  onSubmit: (input: AdminResetPasswordInput) => void;
  isSubmitting: boolean;
}

/** `POST /users/:id/reset-password` — admin action, no current-password
 * check. Revokes every session the target user holds. */
export function ResetPasswordDialog({
  open,
  onOpenChange,
  userLabel,
  onSubmit,
  isSubmitting,
}: ResetPasswordDialogProps) {
  const form = useAppForm(resetPasswordSchema, { defaultValues: { newPassword: '', confirmPassword: '' } });

  function handleSubmit(values: ResetPasswordFormValues) {
    onSubmit({ newPassword: values.newPassword });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password for {userLabel}</DialogTitle>
        </DialogHeader>

        <Alert variant="warning">
          <AlertDescription>This will log the user out of every device.</AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
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
              Reset password
            </FormSubmitButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
