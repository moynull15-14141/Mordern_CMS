'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';

export interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleTitle: string;
  onConfirm: () => void | Promise<void>;
}

/** `POST /articles/:id/publish` — publishes immediately, `article.publish`-gated. */
export function PublishDialog({ open, onOpenChange, articleTitle, onConfirm }: PublishDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Publish article"
      description={`Publish "${articleTitle}" immediately? It will become visible per its visibility setting.`}
      confirmLabel="Publish"
      onConfirm={onConfirm}
    />
  );
}
