'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';

export interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userLabel: string;
  onConfirm: () => void | Promise<void>;
}

/** `DELETE /users/:id` — soft delete, restorable via `RestoreDialog`. */
export function DeleteDialog({ open, onOpenChange, userLabel, onConfirm }: DeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete user"
      description={`Delete "${userLabel}"? This can be undone by restoring the user afterward.`}
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
}
