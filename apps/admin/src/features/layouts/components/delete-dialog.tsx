'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';

export interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layoutName: string;
  onConfirm: () => void | Promise<void>;
}

/** `DELETE /layouts/:id` — soft delete, restorable via `RestoreDialog`. */
export function DeleteDialog({ open, onOpenChange, layoutName, onConfirm }: DeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete layout"
      description={`Delete "${layoutName}"? This can be undone by restoring it later.`}
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
}
