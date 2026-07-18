'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';

export interface ActivateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  themeName: string;
  onConfirm: () => void | Promise<void>;
}

/** `POST /themes/:id/activate` — automatically deactivates the site's
 * previous active theme server-side (see docs/72_BACKEND_THEMES.md
 * "Activation Flow"), `theme.manage`-gated. */
export function ActivateDialog({ open, onOpenChange, themeName, onConfirm }: ActivateDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Activate theme"
      description={`Activate "${themeName}"? This will replace the site's current active theme.`}
      confirmLabel="Activate"
      onConfirm={onConfirm}
    />
  );
}
