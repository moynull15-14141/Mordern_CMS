'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';

export interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageTitle: string;
  onConfirm: () => void | Promise<void>;
}

/** `DELETE /pages/:id` — soft delete, restorable via `RestoreDialog`. */
export function DeleteDialog({ open, onOpenChange, pageTitle, onConfirm }: DeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete page"
      description={`Delete "${pageTitle}"? This can be undone by restoring it later.`}
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
}
