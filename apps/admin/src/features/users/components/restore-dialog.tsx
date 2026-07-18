'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';

export interface RestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userLabel: string;
  onConfirm: () => void | Promise<void>;
}

/** `POST /users/:id/restore` — clears `deletedAt`/`deletedBy`. */
export function RestoreDialog({ open, onOpenChange, userLabel, onConfirm }: RestoreDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Restore user"
      description={`Restore "${userLabel}"?`}
      confirmLabel="Restore"
      onConfirm={onConfirm}
    />
  );
}
