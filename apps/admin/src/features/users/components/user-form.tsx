'use client';

import { useEffect } from 'react';
import { useAppForm } from '@/hooks/use-app-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form/form';
import { FormSubmitButton } from '@/components/form/form-submit-button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createUserSchema, type CreateUserFormValues } from '../schemas/create-user.schema';
import { updateUserSchema, type UpdateUserFormValues } from '../schemas/update-user.schema';

/**
 * Two related, colocated forms (not one generically-typed component) since
 * `CreateUserDto`/`UpdateUserDto` are genuinely different shapes (`email`/
 * `password` exist only on create) — docs/59_FRONTEND_CODING_GUIDELINES.md
 * "Types mirror backend DTOs 1:1". Neither renders a status or role field:
 * `CreateUserDto`/`UpdateUserDto` have none (a created user is always
 * `PENDING`; see docs/63_FRONTEND_USERS.md).
 */

export interface CreateUserFormProps {
  onSubmit: (values: CreateUserFormValues) => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

export function CreateUserForm({ onSubmit, isSubmitting, submitError }: CreateUserFormProps) {
  const form = useAppForm(createUserSchema, {
    defaultValues: { email: '', username: '', displayName: '', password: '' },
  });

  // Wrapped so onSubmit only ever receives the values, never RHF's second
  // (event) argument — matches features/auth/components/login-form.tsx's
  // established pattern.
  function handleSubmit(values: CreateUserFormValues) {
    onSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
        {submitError ? (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="user@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input autoComplete="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password (optional)</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormSubmitButton isLoading={isSubmitting} disabled={isSubmitting}>
          Create user
        </FormSubmitButton>
      </form>
    </Form>
  );
}

export interface EditUserFormProps {
  defaultValues: UpdateUserFormValues;
  onSubmit: (values: UpdateUserFormValues) => void;
  isSubmitting: boolean;
  submitError?: string | null;
  onDirtyChange?: (dirty: boolean) => void;
}

/** Identity fields only (`username`/`displayName`) — no status/role field
 * exists on `UpdateUserDto`. Pessimistic (approved decision 5): the caller
 * only navigates/updates the UI after `onSubmit`'s mutation resolves.
 * `onDirtyChange` drives the page's cancel/navigate-away warning. */
export function EditUserForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitError,
  onDirtyChange,
}: EditUserFormProps) {
  const form = useAppForm(updateUserSchema, { defaultValues });
  const { isDirty } = form.formState;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  function handleSubmit(values: UpdateUserFormValues) {
    onSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
        {submitError ? (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input autoComplete="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormSubmitButton isLoading={isSubmitting} disabled={isSubmitting || !form.formState.isDirty}>
          Save changes
        </FormSubmitButton>
      </form>
    </Form>
  );
}
