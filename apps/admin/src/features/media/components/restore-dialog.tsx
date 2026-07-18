'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';

export interface RestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filename: string;
  onConfirm: () => void | Promise<void>;
}

/** `POST /media/:id/restore` — reuses `media.delete` (no `media.restore`
 * permission exists). */
export function RestoreDialog({ open, onOpenChange, filename, onConfirm }: RestoreDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Restore media"
      description={`Restore "${filename}"?`}
      confirmLabel="Restore"
      onConfirm={onConfirm}
    />
  );
}
