'use client';

import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { SETTING_CATEGORY_LABELS } from '../constants/settings.constants';
import type { SettingCategory } from '../types/settings';

export interface ResetCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: SettingCategory;
  onConfirm: () => void | Promise<void>;
}

/** `POST /settings/reset/category` — the real analog to "restore" for a
 * fixed setting catalog with no per-row delete (docs/64_FRONTEND_SETTINGS.md
 * "Conflicts Discovered"): resets every setting in one category back to its
 * system default. Destructive — any database override in this category is
 * discarded. */
export function ResetCategoryDialog({ open, onOpenChange, category, onConfirm }: ResetCategoryDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Reset category to defaults"
      description={`Reset every setting in "${SETTING_CATEGORY_LABELS[category]}" back to its system default? This cannot be undone.`}
      confirmLabel="Reset category"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
}
