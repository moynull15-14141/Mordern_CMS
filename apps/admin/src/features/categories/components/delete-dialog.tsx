'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';

export interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  onConfirm: () => void | Promise<void>;
}

/** `DELETE /categories/:id` — soft delete; the backend itself rejects the
 * request (with a normal error response, surfaced via the mutation's error
 * state) if the category is still used by articles or has active children. */
export function DeleteDialog({ open, onOpenChange, categoryName, onConfirm }: DeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete category"
      description={`Delete "${categoryName}"? This is rejected if the category is still used by articles or has active children.`}
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
}
