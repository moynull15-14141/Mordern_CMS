'use client';

import { z } from 'zod';
import { useState } from 'react';
import { useAppForm } from '@/hooks/use-app-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form/form';
import { Textarea } from '@/components/ui/textarea';
import { COMMENT_MODERATION_REASON_MAX_LENGTH } from '../constants/comments.constants';

const moderationReasonSchema = z.object({
  reason: z.string().max(COMMENT_MODERATION_REASON_MAX_LENGTH).optional().or(z.literal('')),
});

const moderationReasonRequiredSchema = z.object({
  reason: z.string().trim().min(1).max(COMMENT_MODERATION_REASON_MAX_LENGTH),
});

export interface CommentReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel?: string;
  required?: boolean;
  isSubmitting?: boolean;
  submitError?: string;
  onSubmit: (reason: string | undefined) => void | Promise<void>;
}

export function CommentReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel = 'Submit',
  required = false,
  isSubmitting,
  submitError,
  onSubmit,
}: CommentReasonDialogProps) {
  const schema = required ? moderationReasonRequiredSchema : moderationReasonSchema;
  const form = useAppForm(schema, { defaultValues: { reason: '' } });
  const [pending, setPending] = useState(false);

  async function handleSubmit(values: z.infer<typeof moderationReasonSchema>) {
    setPending(true);
    try {
      await onSubmit(values.reason?.trim() || undefined);
      onOpenChange(false);
      form.reset({ reason: '' });
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={5} placeholder={required ? 'Required reason' : 'Optional note'} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending || isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" isLoading={pending || isSubmitting}>
                {submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
