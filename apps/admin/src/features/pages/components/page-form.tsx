'use client';

import { useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BlockEditor } from '@/features/block-editor';
import { SeoFields } from './seo-fields';
import { GENERIC_UPDATE_STATUS_OPTIONS } from '../constants/page.constants';
import { createPageSchema, type CreatePageFormValues } from '../schemas/create-page.schema';
import { updatePageSchema, type UpdatePageFormValues } from '../schemas/update-page.schema';

/**
 * Two related, colocated forms (not one generically-typed component) since
 * `CreatePageDto`/`UpdatePageDto` are genuinely different shapes (`status`
 * only exists on update) — same reasoning `article-form.tsx` established.
 * The Content field is the Rich Content Engine's Block Editor (Milestone
 * 3, `@/features/block-editor`) — this form only *consumes* it as a
 * controlled field, same as `article-form.tsx`.
 */

export interface CreatePageFormProps {
  onSubmit: (values: CreatePageFormValues) => void;
  isSubmitting: boolean;
  submitError?: string | null;
  onDirtyChange?: (dirty: boolean) => void;
}

export function CreatePageForm({
  onSubmit,
  isSubmitting,
  submitError,
  onDirtyChange,
}: CreatePageFormProps) {
  const form = useAppForm(createPageSchema, {
    defaultValues: {
      title: '',
      slug: '',
      body: [],
      seo: {
        title: '',
        description: '',
        canonicalUrl: '',
        keywords: '',
        noIndex: false,
        noFollow: false,
        ogImage: '',
      },
    },
  });
  const { isDirty } = form.formState;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  function handleSubmit(values: CreatePageFormValues) {
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
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
                <Input placeholder="Leave blank to auto-generate from title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <BlockEditor value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SeoFields control={form.control} />

        <FormSubmitButton isLoading={isSubmitting} disabled={isSubmitting}>
          Create page
        </FormSubmitButton>
      </form>
    </Form>
  );
}

export interface EditPageFormProps {
  defaultValues: UpdatePageFormValues;
  onSubmit: (values: UpdatePageFormValues) => void;
  isSubmitting: boolean;
  submitError?: string | null;
  onDirtyChange?: (dirty: boolean) => void;
}

/** `status` is restricted to DRAFT/REVIEW/ARCHIVED — PUBLISHED is set only
 * via the dedicated Publish action on the Detail page. */
export function EditPageForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitError,
  onDirtyChange,
}: EditPageFormProps) {
  const form = useAppForm(updatePageSchema, { defaultValues });
  const { isDirty } = form.formState;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  function handleSubmit(values: UpdatePageFormValues) {
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
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
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <BlockEditor value={field.value} onChange={field.onChange} />
              </FormControl>
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
                  {GENERIC_UPDATE_STATUS_OPTIONS.map((option) => (
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

        <SeoFields control={form.control} />

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
