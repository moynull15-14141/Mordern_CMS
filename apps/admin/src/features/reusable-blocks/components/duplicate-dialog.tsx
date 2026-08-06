'use client';

import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import type { ReusableBlock } from '../types/reusable-block';

const duplicateNameSchema = z.object({
  name: z
    .string()
    .min(2, 'Must be at least 2 characters.')
    .max(200, 'Must be 200 characters or fewer.'),
});
type DuplicateNameFormValues = z.infer<typeof duplicateNameSchema>;

export interface DuplicateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: ReusableBlock | null;
  onSubmit: (name: string) => void;
  isSubmitting: boolean;
}

/** No dedicated backend endpoint — this just prompts for the new copy's
 * name before `useDuplicateReusableBlock` composes a `create` call from
 * the source block (`services/reusable-blocks.api.ts`'s `duplicate`). */
export function DuplicateDialog({
  open,
  onOpenChange,
  block,
  onSubmit,
  isSubmitting,
}: DuplicateDialogProps) {
  const form = useAppForm(duplicateNameSchema, {
    values: { name: block ? `${block.name} (copy)` : '' },
  });

  function handleSubmit(values: DuplicateNameFormValues) {
    onSubmit(values.name);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duplicate reusable block</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormSubmitButton isLoading={isSubmitting} disabled={isSubmitting}>
              Duplicate
            </FormSubmitButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
