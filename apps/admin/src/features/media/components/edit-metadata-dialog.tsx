'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppForm } from '@/hooks/use-app-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form/form';
import { FormSubmitButton } from '@/components/form/form-submit-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { STATUS_OPTIONS } from '../constants/media.constants';
import { updateMediaAssetSchema, type UpdateMediaAssetFormValues } from '../schemas/update-media-asset.schema';
import type { UpdateMediaAssetInput } from '../types/media';

export interface EditMetadataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues: UpdateMediaAssetFormValues;
  onSubmit: (input: UpdateMediaAssetInput) => void;
  isSubmitting: boolean;
}

/** `PATCH /media/:id` — altText/caption/credit/status only; the only
 * backend-supported metadata fields (`UpdateMediaAssetDto`). */
export function EditMetadataDialog({ open, onOpenChange, defaultValues, onSubmit, isSubmitting }: EditMetadataDialogProps) {
  const form = useAppForm(updateMediaAssetSchema, { defaultValues });

  // Wrapped so onSubmit only ever receives the values, never RHF's second
  // (event) argument — matches every other form's established pattern
  // (e.g. `features/articles/components/article-form.tsx`).
  function handleSubmit(values: UpdateMediaAssetFormValues) {
    onSubmit(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit metadata</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="altText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alt text</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caption</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credit</FormLabel>
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
            <FormSubmitButton isLoading={isSubmitting} disabled={isSubmitting}>
              Save changes
            </FormSubmitButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
