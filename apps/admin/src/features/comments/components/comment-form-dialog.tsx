'use client';

import { z } from 'zod';
import { useState } from 'react';
import { useAppForm } from '@/hooks/use-app-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form/form';
import { Textarea } from '@/components/ui/textarea';
import { COMMENT_BODY_MAX_LENGTH, COMMENT_BODY_MIN_LENGTH } from '../constants/comments.constants';

const commentBodySchema = z.object({
  body: z.string().trim().min(COMMENT_BODY_MIN_LENGTH).max(COMMENT_BODY_MAX_LENGTH),
});

export interface CommentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel?: string;
  defaultBody?: string;
  isSubmitting?: boolean;
  submitError?: string;
  onSubmit: (body: string) => void | Promise<void>;
}

export function CommentFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel = 'Save',
  defaultBody = '',
  isSubmitting,
  submitError,
  onSubmit,
}: CommentFormDialogProps) {
  const form = useAppForm(commentBodySchema, { defaultValues: { body: defaultBody } });
  const [pending, setPending] = useState(false);

  async function handleSubmit(values: z.infer<typeof commentBodySchema>) {
    setPending(true);
    try {
      await onSubmit(values.body);
      onOpenChange(false);
      form.reset({ body: '' });
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
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={8} placeholder="Write the comment body" />
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
