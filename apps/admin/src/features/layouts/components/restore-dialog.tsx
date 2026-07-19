'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';

export interface RestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layoutName: string;
  onConfirm: () => void | Promise<void>;
}

/** `POST /layouts/:id/restore` — `layout.manage`-gated. */
export function RestoreDialog({ open, onOpenChange, layoutName, onConfirm }: RestoreDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Restore layout"
      description={`Restore "${layoutName}"?`}
      confirmLabel="Restore"
      onConfirm={onConfirm}
    />
  );
}
