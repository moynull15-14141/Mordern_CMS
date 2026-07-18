'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';

export interface RestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tagName: string;
  onConfirm: () => void | Promise<void>;
}

/** `POST /tags/:id/restore` — reuses `category.create` (no `tag.restore`
 * permission exists). */
export function RestoreDialog({ open, onOpenChange, tagName, onConfirm }: RestoreDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Restore tag"
      description={`Restore "${tagName}"?`}
      confirmLabel="Restore"
      onConfirm={onConfirm}
    />
  );
}
