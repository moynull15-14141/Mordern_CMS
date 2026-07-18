'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';

export interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleTitle: string;
  onConfirm: () => void | Promise<void>;
}

/** `DELETE /articles/:id` — soft delete, restorable via `RestoreDialog`. */
export function DeleteDialog({ open, onOpenChange, articleTitle, onConfirm }: DeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete article"
      description={`Delete "${articleTitle}"? This can be undone by restoring it later.`}
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
}
