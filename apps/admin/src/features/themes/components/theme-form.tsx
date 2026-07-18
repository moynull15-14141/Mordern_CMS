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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AppearanceSettingsFields } from './appearance-settings-fields';
import { ThemePreview } from './theme-preview';
import { STATUS_OPTIONS } from '../constants/theme.constants';
import { createThemeSchema, type CreateThemeFormValues } from '../schemas/create-theme.schema';
import { updateThemeSchema, type UpdateThemeFormValues } from '../schemas/update-theme.schema';

const EMPTY_SETTINGS = {
  logo: '',
  favicon: '',
  primaryColor: '',
  secondaryColor: '',
  typographyText: '',
  headerLayout: '',
  footerLayout: '',
  containerWidth: '',
  borderRadius: '',
  buttonStyle: '',
  homepageLayout: '',
  blogLayout: '',
  customCss: '',
  customJs: '',
};

export interface CreateThemeFormProps {
  onSubmit: (values: CreateThemeFormValues) => void;
  isSubmitting: boolean;
  submitError?: string | null;
  onDirtyChange?: (dirty: boolean) => void;
}

export function CreateThemeForm({
  onSubmit,
  isSubmitting,
  submitError,
  onDirtyChange,
}: CreateThemeFormProps) {
  const form = useAppForm(createThemeSchema, {
    defaultValues: {
      name: '',
      slug: '',
      version: '',
      author: '',
      description: '',
      thumbnail: '',
      settings: EMPTY_SETTINGS,
    },
  });
  const { isDirty } = form.formState;
  const settings = form.watch('settings');

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  function handleSubmit(values: CreateThemeFormValues) {
    onSubmit(values);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Version</FormLabel>
                  <FormControl>
                    <Input placeholder="1.0.0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
            name="thumbnail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thumbnail URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <AppearanceSettingsFields control={form.control} />

          <FormSubmitButton isLoading={isSubmitting} disabled={isSubmitting}>
            Create theme
          </FormSubmitButton>
        </form>
      </Form>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <ThemePreview settings={settings ?? {}} />
      </div>
    </div>
  );
}

export interface EditThemeFormProps {
  defaultValues: UpdateThemeFormValues;
  onSubmit: (values: UpdateThemeFormValues) => void;
  isSubmitting: boolean;
  submitError?: string | null;
  onDirtyChange?: (dirty: boolean) => void;
}

/** `isActive` is never editable here — that only ever changes via the
 * dedicated Activate action on the Detail page. */
export function EditThemeForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitError,
  onDirtyChange,
}: EditThemeFormProps) {
  const form = useAppForm(updateThemeSchema, { defaultValues });
  const { isDirty } = form.formState;
  const settings = form.watch('settings');

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  function handleSubmit(values: UpdateThemeFormValues) {
    onSubmit(values);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Version</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
            name="thumbnail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thumbnail URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://…" {...field} />
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

          <AppearanceSettingsFields control={form.control} />

          <FormSubmitButton
            isLoading={isSubmitting}
            disabled={isSubmitting || !form.formState.isDirty}
          >
            Save changes
          </FormSubmitButton>
        </form>
      </Form>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <ThemePreview settings={settings ?? {}} />
      </div>
    </div>
  );
}
