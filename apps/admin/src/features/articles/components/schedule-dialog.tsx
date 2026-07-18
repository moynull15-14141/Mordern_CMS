'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAppForm } from '@/hooks/use-app-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form/form';
import { FormSubmitButton } from '@/components/form/form-submit-button';
import { Input } from '@/components/ui/input';
import { scheduleArticleSchema, type ScheduleArticleFormValues } from '../schemas/schedule-article.schema';
import type { ScheduleArticleInput } from '../types/article';

export interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleTitle: string;
  onSubmit: (input: ScheduleArticleInput) => void;
  isSubmitting: boolean;
}

/** `POST /articles/:id/schedule` — `scheduledAt` must be a future ISO
 * date-time; the datetime-local input's value is converted to a full ISO
 * string on submit. */
export function ScheduleDialog({ open, onOpenChange, articleTitle, onSubmit, isSubmitting }: ScheduleDialogProps) {
  const form = useAppForm(scheduleArticleSchema, { defaultValues: { scheduledAt: '' } });

  function handleSubmit(values: ScheduleArticleFormValues) {
    onSubmit({ scheduledAt: new Date(values.scheduledAt).toISOString() });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule &quot;{articleTitle}&quot;</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="scheduledAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publish date &amp; time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormSubmitButton isLoading={isSubmitting} disabled={isSubmitting}>
              Schedule
            </FormSubmitButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
