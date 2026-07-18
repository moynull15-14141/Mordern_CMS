'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppForm } from '@/hooks/use-app-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form/form';
import { FormSubmitButton } from '@/components/form/form-submit-button';
import { ParentCategorySelect } from './parent-category-select';
import { useCategoryDescendants } from '../hooks/use-category-descendants';
import { moveCategorySchema, type MoveCategoryFormValues } from '../schemas/move-category.schema';
import type { MoveCategoryInput } from '../types/category';

export interface MoveCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  categoryName: string;
  currentParentId: string | null;
  onSubmit: (input: MoveCategoryInput) => void;
  isSubmitting: boolean;
}

/** `POST /categories/:id/move` — circular-reference safe on the backend;
 * `excludeIds` (self + every descendant, `GET /:id/descendants`) keeps an
 * invalid choice from ever appearing in the selector in the first place. */
export function MoveCategoryDialog({
  open,
  onOpenChange,
  categoryId,
  categoryName,
  currentParentId,
  onSubmit,
  isSubmitting,
}: MoveCategoryDialogProps) {
  const { data: descendants } = useCategoryDescendants(open ? categoryId : '');
  const form = useAppForm(moveCategorySchema, { defaultValues: { parentId: currentParentId ?? '' } });

  function handleSubmit(values: MoveCategoryFormValues) {
    onSubmit({ parentId: values.parentId || null });
  }

  const excludeIds = [categoryId, ...(descendants ?? []).map((node) => node.id)];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move &quot;{categoryName}&quot;</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New parent</FormLabel>
                  <FormControl>
                    <ParentCategorySelect
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      excludeIds={excludeIds}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormSubmitButton isLoading={isSubmitting} disabled={isSubmitting}>
              Move
            </FormSubmitButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
