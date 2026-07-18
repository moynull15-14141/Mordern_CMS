'use client';

import { useAppForm } from '@/hooks/use-app-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form/form';
import { FormSubmitButton } from '@/components/form/form-submit-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { THEME_PREFERENCE_OPTIONS } from '@/features/users';
import { updatePreferencesSchema, type UpdatePreferencesFormValues } from '../schemas/update-preferences.schema';

export interface PreferencesFormProps {
  defaultValues: UpdatePreferencesFormValues;
  onSubmit: (values: UpdatePreferencesFormValues) => void;
  isSubmitting: boolean;
}

/** `PATCH /users/me/preferences` — theme + notification channels only in
 * this milestone's UI (`editorPreference`/`dashboardPreference`/
 * `accessibilityPreference` are opaque JSON with no closed shape to build
 * a form against — see docs/63_FRONTEND_USERS.md). */
export function PreferencesForm({ defaultValues, onSubmit, isSubmitting }: PreferencesFormProps) {
  const form = useAppForm(updatePreferencesSchema, { defaultValues });

  // Wrapped so onSubmit only ever receives the values, never RHF's second
  // (event) argument.
  function handleSubmit(values: UpdatePreferencesFormValues) {
    onSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="theme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theme</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="System" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {THEME_PREFERENCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notificationPreference.email"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Email notifications</FormLabel>
              <FormControl>
                <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notificationPreference.inApp"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>In-app notifications</FormLabel>
              <FormControl>
                <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormSubmitButton isLoading={isSubmitting} disabled={isSubmitting}>
          Save preferences
        </FormSubmitButton>
      </form>
    </Form>
  );
}
