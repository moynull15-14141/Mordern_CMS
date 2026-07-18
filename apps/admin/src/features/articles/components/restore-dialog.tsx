'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';

export interface RestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleTitle: string;
  onConfirm: () => void | Promise<void>;
}

/** `POST /articles/:id/restore` — reuses `article.delete` (no
 * `article.restore` permission exists). */
export function RestoreDialog({ open, onOpenChange, articleTitle, onConfirm }: RestoreDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Restore article"
      description={`Restore "${articleTitle}"?`}
      confirmLabel="Restore"
      onConfirm={onConfirm}
    />
  );
}
