'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';

export interface ResetAllDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}

/** `POST /settings/reset` — resets the entire 34-entry catalog back to
 * system defaults. The overview page's global "Reset all settings" action;
 * distinct from `ResetCategoryDialog`, which scopes to one category. */
export function ResetAllDialog({ open, onOpenChange, onConfirm }: ResetAllDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Reset all settings"
      description="Reset every setting across every category back to its system default? This cannot be undone."
      confirmLabel="Reset all settings"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
}
