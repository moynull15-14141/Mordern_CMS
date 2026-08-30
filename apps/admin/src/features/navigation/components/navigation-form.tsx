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
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/utils/cn';
import { createMenuSchema, type CreateMenuFormValues } from '../schemas/create-menu.schema';
import { SUGGESTED_MENU_LOCATIONS } from '../constants/menu.constants';

export interface NavigationFormProps {
  onSubmit: (values: CreateMenuFormValues) => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

/** The Create Navigation form — Name (+ auto-slug) and an optional
 * Location, offered as one-click suggestions (Header/Footer/Secondary)
 * since the backend column itself takes any string (§A.4); a site owner
 * can still type their own. Item authoring happens on the next page (the
 * tree editor), matching `CreateMenuDto` not accepting inline items. */
export function NavigationForm({ onSubmit, isSubmitting, submitError }: NavigationFormProps) {
  const form = useAppForm(createMenuSchema, {
    defaultValues: { name: '', slug: '', location: '' },
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Navigation name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Main Navigation" {...field} />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Give this menu a name you&apos;ll recognize later.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Where is this used?</FormLabel>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_MENU_LOCATIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(field.value === option.value && 'border-primary bg-accent')}
                    onClick={() => field.onChange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              <FormControl>
                <Input placeholder="Or type a custom location (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormSubmitButton isLoading={isSubmitting} disabled={isSubmitting}>
          Create navigation
        </FormSubmitButton>
      </form>
    </Form>
  );
}
