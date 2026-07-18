'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppForm } from '@/hooks/use-app-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form/form';
import { FormSubmitButton } from '@/components/form/form-submit-button';
import { Input } from '@/components/ui/input';
import { renameMediaAssetSchema, type RenameMediaAssetFormValues } from '../schemas/rename-media-asset.schema';
import type { RenameMediaAssetInput } from '../types/media';

export interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilename: string;
  onSubmit: (input: RenameMediaAssetInput) => void;
  isSubmitting: boolean;
}

/** `POST /media/:id/rename` — logical display name only; `storageKey`
 * (the real, immutable storage locator) is never changed. */
export function RenameDialog({ open, onOpenChange, currentFilename, onSubmit, isSubmitting }: RenameDialogProps) {
  const form = useAppForm(renameMediaAssetSchema, { defaultValues: { filename: currentFilename } });

  function handleSubmit(values: RenameMediaAssetFormValues) {
    onSubmit(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="filename"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filename</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormSubmitButton isLoading={isSubmitting} disabled={isSubmitting}>
              Rename
            </FormSubmitButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
