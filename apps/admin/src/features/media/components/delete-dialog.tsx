'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';

export interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filename: string;
  onConfirm: () => void | Promise<void>;
}

/** `DELETE /media/:id` — soft delete; rejected by the backend if the asset
 * is still referenced anywhere. */
export function DeleteDialog({ open, onOpenChange, filename, onConfirm }: DeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete media"
      description={`Delete "${filename}"? This is rejected if it's still referenced anywhere.`}
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
}
