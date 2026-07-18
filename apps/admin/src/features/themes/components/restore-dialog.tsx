'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';

export interface RestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  themeName: string;
  onConfirm: () => void | Promise<void>;
}

/** `POST /themes/:id/restore` — `theme.manage`-gated. */
export function RestoreDialog({ open, onOpenChange, themeName, onConfirm }: RestoreDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Restore theme"
      description={`Restore "${themeName}"?`}
      confirmLabel="Restore"
      onConfirm={onConfirm}
    />
  );
}
