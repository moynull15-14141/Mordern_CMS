'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useReusableBlockUsages } from '../hooks/use-reusable-block-usages';
import { UsageList } from './usage-list';
import type { ReusableBlock } from '../types/reusable-block';

export interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: ReusableBlock | null;
  onConfirm: () => void | Promise<void>;
}

/**
 * Unlike every other dialog in this feature, this one is NOT a thin
 * `ConfirmDialog` wrapper — its content is data-dependent across 3 states,
 * fetched lazily (`enabled: open`, so nothing is requested until the
 * dialog is actually open — no duplicate/eager requests from the list
 * page): loading, blocked (still referenced — shows where, links to each,
 * confirm disabled), and confirmable (no usages — normal destructive
 * confirm). The mutation's own `onError` toast
 * (`use-delete-reusable-block.ts`) stays the last-line defense against a
 * race between opening this dialog and clicking confirm.
 */
export function DeleteDialog({ open, onOpenChange, block, onConfirm }: DeleteDialogProps) {
  const { data: usages, isLoading } = useReusableBlockUsages(block?.id ?? '', { enabled: open });
  const isBlocked = !isLoading && (usages?.length ?? 0) > 0;

  async function handleConfirm() {
    await onConfirm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete reusable block</DialogTitle>
          <DialogDescription>
            {isBlocked
              ? `"${block?.name}" is still used in ${usages?.length} place${usages?.length === 1 ? '' : 's'} and can't be deleted until those references are removed.`
              : `Delete "${block?.name}"? This can be undone by restoring it later.`}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : null}
        {isBlocked && usages ? <UsageList usages={usages} /> : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {!isBlocked ? (
            <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
              Delete
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
