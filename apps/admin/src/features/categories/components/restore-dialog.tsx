'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';

export interface RestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  onConfirm: () => void | Promise<void>;
}

/** `POST /categories/:id/restore` — reuses `category.create` (no
 * `category.restore` permission exists). */
export function RestoreDialog({ open, onOpenChange, categoryName, onConfirm }: RestoreDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Restore category"
      description={`Restore "${categoryName}"?`}
      confirmLabel="Restore"
      onConfirm={onConfirm}
    />
  );
}
