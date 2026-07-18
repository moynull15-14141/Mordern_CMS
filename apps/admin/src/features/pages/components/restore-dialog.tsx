'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';

export interface RestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageTitle: string;
  onConfirm: () => void | Promise<void>;
}

/** `POST /pages/:id/restore` — `page.manage`-gated. */
export function RestoreDialog({ open, onOpenChange, pageTitle, onConfirm }: RestoreDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Restore page"
      description={`Restore "${pageTitle}"?`}
      confirmLabel="Restore"
      onConfirm={onConfirm}
    />
  );
}
