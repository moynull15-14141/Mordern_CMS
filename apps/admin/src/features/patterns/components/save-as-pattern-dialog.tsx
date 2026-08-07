'use client';

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
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/lib/toast';
import { isApiError } from '@/lib/api-error';
import { useCreatePatternFromEditor } from '../hooks/use-create-pattern-from-editor';
import {
  saveAsPatternSchema,
  type SaveAsPatternFormValues,
} from '../schemas/save-as-pattern.schema';
import type { Pattern } from '../types/pattern';
import type { BlockNode } from '@/features/block-editor';

export interface SaveAsPatternDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The selected section/container, meta already stripped by the caller
   * — a Pattern is a standalone composition, so positional metadata from
   * the source tree (column placement, anchors) is meaningless once saved. */
  sourceBlock: Pick<BlockNode, 'id' | 'type' | 'data' | 'children'>;
  onSaved: (created: Pattern) => void;
}

/**
 * The "Save as Pattern" flow (Milestone 6 spec) — Name/Description/
 * Category/Tags → Save, an exact structural mirror of
 * `SaveAsReusableBlockDialog`. The original page/article is never touched:
 * this only ever reads the selected block, it never mutates the editor's
 * tree.
 */
export function SaveAsPatternDialog({
  open,
  onOpenChange,
  sourceBlock,
  onSaved,
}: SaveAsPatternDialogProps) {
  const form = useAppForm(saveAsPatternSchema, {
    values: { name: '', description: '', category: '', tags: '' },
  });
  const createMutation = useCreatePatternFromEditor();

  function handleSubmit(values: SaveAsPatternFormValues) {
    const tags = values.tags
      ? values.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : undefined;

    createMutation.mutate(
      {
        name: values.name,
        description: values.description || undefined,
        category: values.category || undefined,
        tags,
        body: {
          blocks: [
            {
              id: sourceBlock.id,
              type: sourceBlock.type,
              data: sourceBlock.data,
              children: sourceBlock.children,
            },
          ],
        },
      },
      {
        onSuccess: (created) => {
          toast.success('Pattern saved.');
          form.reset({ name: '', description: '', category: '', tags: '' });
          onOpenChange(false);
          onSaved(created);
        },
      }
    );
  }

  const submitError = createMutation.isError
    ? isApiError(createMutation.error)
      ? createMutation.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as pattern</DialogTitle>
        </DialogHeader>

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
                    <Input {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Hero, Pricing, Testimonials (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="Comma-separated (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormSubmitButton
              isLoading={createMutation.isPending}
              disabled={createMutation.isPending}
            >
              Save
            </FormSubmitButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
