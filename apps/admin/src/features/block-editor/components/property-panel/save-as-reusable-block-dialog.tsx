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
import { useCreateReusableBlockFromEditor } from '../../hooks/use-create-reusable-block-from-editor';
import {
  saveAsReusableBlockSchema,
  type SaveAsReusableBlockFormValues,
} from '../../schemas/save-as-reusable-block.schema';
import type { ReusableBlockSummary } from '../../api/reusable-block.types';
import type { BlockNode } from '../../types/block.types';

export interface SaveAsReusableBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Meta already stripped by the caller (`ReusableBlockActions`) — it
   * described the block's position in the source tree, meaningless once
   * saved standalone. */
  sourceBlock: Pick<BlockNode, 'type' | 'data' | 'children'>;
  onSaved: (created: ReusableBlockSummary) => void;
}

/**
 * The "Name / Description / Category → Save" flow (spec §2) — used both
 * by plain "Save as reusable" (no tree mutation afterward) and "Convert to
 * reusable" (the caller replaces the original block with a reference once
 * `onSaved` fires). Errors are shown inline (matches every other create
 * form in this codebase), success is toasted here since — unlike the
 * dedicated Reusable Blocks management module — there's no page
 * navigation to carry the "created" feedback instead.
 */
export function SaveAsReusableBlockDialog({
  open,
  onOpenChange,
  sourceBlock,
  onSaved,
}: SaveAsReusableBlockDialogProps) {
  const form = useAppForm(saveAsReusableBlockSchema, {
    values: { name: '', description: '', category: '' },
  });
  const createMutation = useCreateReusableBlockFromEditor();

  function handleSubmit(values: SaveAsReusableBlockFormValues) {
    createMutation.mutate(
      {
        name: values.name,
        description: values.description || undefined,
        category: values.category || undefined,
        blockType: sourceBlock.type,
        data: sourceBlock.data,
        children: sourceBlock.children,
      },
      {
        onSuccess: (created) => {
          toast.success('Reusable block saved.');
          form.reset({ name: '', description: '', category: '' });
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
          <DialogTitle>Save as reusable block</DialogTitle>
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
                    <Input placeholder="e.g. Marketing (optional, free text)" {...field} />
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
