'use client';

import Link from 'next/link';
import { useAppForm } from '@/hooks/use-app-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/form/form';
import { FormSubmitButton } from '@/components/form/form-submit-button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ROUTES } from '@/constants/routes';
import { isApiError } from '@/lib/api-error';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/login.schema';
import { useLogin } from '@/features/auth/hooks/use-login';

/** Login Page — Frontend Milestone 2 scope: email, password, remember me,
 * forgot-password link, show-password toggle, loading state, validation,
 * backend error display. No redirect logic here — GuestRoute performs the
 * post-login redirect once `isAuthenticated` flips (see useLogin). */
export function LoginForm() {
  const form = useAppForm(loginSchema, {
    defaultValues: { email: '', password: '', rememberMe: false },
  });
  const loginMutation = useLogin();

  function onSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
  }

  const errorMessage = loginMutation.isError
    ? isApiError(loginMutation.error)
      ? loginMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1 text-center">
          <h1 className="text-lg font-semibold">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access the admin panel.
          </p>
        </div>

        {errorMessage ? (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                Remember me
              </label>
            )}
          />
          <Link href={ROUTES.FORGOT_PASSWORD} className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        {/* isLoading/disabled passed explicitly (not left to FormSubmitButton's
            default formState.isSubmitting) — onSubmit fire-and-forgets
            loginMutation.mutate(), so RHF's own isSubmitting resolves
            immediately and would never reflect the actual in-flight
            request; the mutation's own isPending is the correct signal. */}
        <FormSubmitButton
          className="w-full"
          isLoading={loginMutation.isPending}
          disabled={loginMutation.isPending}
        >
          Sign in
        </FormSubmitButton>
      </form>
    </Form>
  );
}
