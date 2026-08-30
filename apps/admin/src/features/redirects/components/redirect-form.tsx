'use client';

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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createRedirectSchema,
  updateRedirectSchema,
  type CreateRedirectFormValues,
  type UpdateRedirectFormValues,
} from '../schemas/redirect.schema';

export interface CreateRedirectFormProps {
  onSubmit: (values: CreateRedirectFormValues) => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

export function CreateRedirectForm({
  onSubmit,
  isSubmitting,
  submitError,
}: CreateRedirectFormProps) {
  const form = useAppForm(createRedirectSchema, {
    defaultValues: { sourcePath: '', destinationUrl: '', redirectType: 301 },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {submitError ? (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}

        <FormField
          control={form.control}
          name="sourcePath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Old path</FormLabel>
              <FormControl>
                <Input placeholder="/old-about" {...field} />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                The path visitors currently land on that no longer works.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="destinationUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Send visitors to</FormLabel>
              <FormControl>
                <Input placeholder="/about or https://example.com/about" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="redirectType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select
                value={String(field.value)}
                onValueChange={(next) => field.onChange(Number(next) as 301 | 302)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="301">301 — Permanent</SelectItem>
                  <SelectItem value="302">302 — Temporary</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Permanent tells search engines the old page moved for good. Use temporary if this
                might change back.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormSubmitButton isLoading={isSubmitting} disabled={isSubmitting}>
          Create redirect
        </FormSubmitButton>
      </form>
    </Form>
  );
}

export interface EditRedirectFormProps {
  defaultValues: UpdateRedirectFormValues;
  onSubmit: (values: UpdateRedirectFormValues) => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

export function EditRedirectForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitError,
}: EditRedirectFormProps) {
  const form = useAppForm(updateRedirectSchema, { defaultValues });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {submitError ? (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}

        <FormField
          control={form.control}
          name="sourcePath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Old path</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="destinationUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Send visitors to</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="redirectType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select
                value={String(field.value)}
                onValueChange={(next) => field.onChange(Number(next) as 301 | 302)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="301">301 — Permanent</SelectItem>
                  <SelectItem value="302">302 — Temporary</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Disabled</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Disabled redirects are kept but stop working on the live site.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormSubmitButton
          isLoading={isSubmitting}
          disabled={isSubmitting || !form.formState.isDirty}
        >
          Save changes
        </FormSubmitButton>
      </form>
    </Form>
  );
}
