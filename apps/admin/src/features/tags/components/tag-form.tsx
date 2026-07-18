'use client';

import { useEffect } from 'react';
import { useAppForm } from '@/hooks/use-app-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form/form';
import { FormSubmitButton } from '@/components/form/form-submit-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createTagSchema, type CreateTagFormValues } from '../schemas/create-tag.schema';
import { updateTagSchema, type UpdateTagFormValues } from '../schemas/update-tag.schema';

/** No SEO section and no Status field — neither `TagResponseDto` nor
 * `CreateTagDto`/`UpdateTagDto` has an `seo` or `status` field (Tags have
 * no SEO capability on the backend at all — see
 * docs/66_FRONTEND_CATEGORIES_TAGS.md "Known Limitations"). */

export interface CreateTagFormProps {
  onSubmit: (values: CreateTagFormValues) => void;
  isSubmitting: boolean;
  submitError?: string | null;
  onDirtyChange?: (dirty: boolean) => void;
}

export function CreateTagForm({ onSubmit, isSubmitting, submitError, onDirtyChange }: CreateTagFormProps) {
  const form = useAppForm(createTagSchema, {
    defaultValues: { name: '', slug: '', description: '', synonyms: '' },
  });
  const { isDirty } = form.formState;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  function handleSubmit(values: CreateTagFormValues) {
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="Leave blank to auto-generate from name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="synonyms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Synonyms (comma-separated)</FormLabel>
              <FormControl>
                <Input placeholder="breaking news, urgent" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormSubmitButton isLoading={isSubmitting} disabled={isSubmitting}>
          Create tag
        </FormSubmitButton>
      </form>
    </Form>
  );
}

export interface EditTagFormProps {
  defaultValues: UpdateTagFormValues;
  onSubmit: (values: UpdateTagFormValues) => void;
  isSubmitting: boolean;
  submitError?: string | null;
  onDirtyChange?: (dirty: boolean) => void;
}

export function EditTagForm({ defaultValues, onSubmit, isSubmitting, submitError, onDirtyChange }: EditTagFormProps) {
  const form = useAppForm(updateTagSchema, { defaultValues });
  const { isDirty } = form.formState;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  function handleSubmit(values: UpdateTagFormValues) {
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="synonyms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Synonyms (comma-separated)</FormLabel>
              <FormControl>
                <Input placeholder="breaking news, urgent" {...field} />
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
