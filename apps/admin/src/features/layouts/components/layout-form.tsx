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
import { ThemeSelect } from './theme-select';
import { PRESET_OPTIONS, STATUS_OPTIONS } from '../constants/layout.constants';
import { createLayoutSchema, type CreateLayoutFormValues } from '../schemas/create-layout.schema';
import { updateLayoutSchema, type UpdateLayoutFormValues } from '../schemas/update-layout.schema';

export interface CreateLayoutFormProps {
  onSubmit: (values: CreateLayoutFormValues) => void;
  isSubmitting: boolean;
  submitError?: string | null;
  onDirtyChange?: (dirty: boolean) => void;
}

export function CreateLayoutForm({
  onSubmit,
  isSubmitting,
  submitError,
  onDirtyChange,
}: CreateLayoutFormProps) {
  const form = useAppForm(createLayoutSchema, {
    defaultValues: { name: '', slug: '', layoutPreset: '', themeId: '' },
  });
  const { isDirty } = form.formState;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-4" noValidate>
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
          name="layoutPreset"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Layout preset</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a preset" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PRESET_OPTIONS.map((option) => (
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
          name="themeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theme compatibility</FormLabel>
              <FormControl>
                <ThemeSelect
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormSubmitButton isLoading={isSubmitting} disabled={isSubmitting}>
          Create layout
        </FormSubmitButton>
      </form>
    </Form>
  );
}

export interface EditLayoutFormProps {
  defaultValues: UpdateLayoutFormValues;
  onSubmit: (values: UpdateLayoutFormValues) => void;
  isSubmitting: boolean;
  submitError?: string | null;
  onDirtyChange?: (dirty: boolean) => void;
}

export function EditLayoutForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitError,
  onDirtyChange,
}: EditLayoutFormProps) {
  const form = useAppForm(updateLayoutSchema, { defaultValues });
  const { isDirty } = form.formState;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-4" noValidate>
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
          name="layoutPreset"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Layout preset</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a preset" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PRESET_OPTIONS.map((option) => (
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
          name="themeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Theme compatibility</FormLabel>
              <FormControl>
                <ThemeSelect
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
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
                  {STATUS_OPTIONS.map((option) => (
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
