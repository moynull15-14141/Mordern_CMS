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
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/utils/cn';
import { updateMenuSchema, type UpdateMenuFormValues } from '../schemas/update-menu.schema';
import { MENU_STATUS_LABEL, SUGGESTED_MENU_LOCATIONS } from '../constants/menu.constants';
import type { Menu, MenuStatus } from '../types/menu';

export interface MenuSettingsFormProps {
  menu: Menu;
  onSubmit: (values: UpdateMenuFormValues) => void;
  isSubmitting: boolean;
  submitError?: string | null;
}

/** The Edit page's Name/Slug/Location/Status section — separate from the
 * item tree below it, which saves structural changes immediately via the
 * reorder endpoint (§ `use-menu-item-mutations.ts`). This form keeps an
 * explicit Save so renaming/relocating/publishing a menu is a deliberate
 * action, not something that fires on every keystroke. */
export function MenuSettingsForm({
  menu,
  onSubmit,
  isSubmitting,
  submitError,
}: MenuSettingsFormProps) {
  const form = useAppForm(updateMenuSchema, {
    defaultValues: {
      name: menu.name,
      slug: menu.slug,
      location: menu.location ?? '',
      status: menu.status,
    },
  });

  useEffect(() => {
    form.reset({
      name: menu.name,
      slug: menu.slug,
      location: menu.location ?? '',
      status: menu.status,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu.id]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {submitError ? (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Navigation name</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <Select
                  value={field.value}
                  onValueChange={(next) => field.onChange(next as MenuStatus)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(Object.keys(MENU_STATUS_LABEL) as MenuStatus[]).map((status) => (
                      <SelectItem key={status} value={status}>
                        {MENU_STATUS_LABEL[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
