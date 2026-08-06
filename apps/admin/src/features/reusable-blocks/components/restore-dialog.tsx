'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';

export interface RestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockName: string;
  onConfirm: () => void | Promise<void>;
}

/** `POST /content-blocks/reusable/:id/restore` — `page.manage`-gated. */
export function RestoreDialog({ open, onOpenChange, blockName, onConfirm }: RestoreDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Restore reusable block"
      description={`Restore "${blockName}"?`}
      confirmLabel="Restore"
      onConfirm={onConfirm}
    />
  );
}
