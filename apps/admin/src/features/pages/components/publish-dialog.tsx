'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';

export interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageTitle: string;
  onConfirm: () => void | Promise<void>;
}

/** `POST /pages/:id/publish` — publishes immediately, `page.manage`-gated.
 * No scheduling option — no `/pages/:id/schedule` endpoint exists. */
export function PublishDialog({ open, onOpenChange, pageTitle, onConfirm }: PublishDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Publish page"
      description={`Publish "${pageTitle}" immediately?`}
      confirmLabel="Publish"
      onConfirm={onConfirm}
    />
  );
}
