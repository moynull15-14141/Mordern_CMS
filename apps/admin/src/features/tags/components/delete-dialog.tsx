'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';

export interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tagName: string;
  onConfirm: () => void | Promise<void>;
}

/** `DELETE /tags/:id` — soft delete; rejected by the backend if the tag is
 * still used by articles. */
export function DeleteDialog({ open, onOpenChange, tagName, onConfirm }: DeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete tag"
      description={`Delete "${tagName}"? This is rejected if the tag is still used by articles.`}
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
}
