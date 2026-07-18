'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';

export interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  themeName: string;
  onConfirm: () => void | Promise<void>;
}

/** `DELETE /themes/:id` — soft delete, restorable via `RestoreDialog`. */
export function DeleteDialog({ open, onOpenChange, themeName, onConfirm }: DeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete theme"
      description={`Delete "${themeName}"? This can be undone by restoring it later.`}
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
}
