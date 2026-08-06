'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/layout/confirm-dialog';
import { toast } from '@/lib/toast';
import { isApiError } from '@/lib/api-error';
import { useEditorActions } from '../../context/use-block-editor';
import { reusableBlocksApi } from '../../api/reusable-blocks.api';
import { cloneWithFreshIds, generateId } from '../../utils/clone-with-fresh-ids';
import { SaveAsReusableBlockDialog } from './save-as-reusable-block-dialog';
import type { ReusableBlockSummary } from '../../api/reusable-block.types';
import type { BlockNode } from '../../types/block.types';

export interface ReusableBlockActionsProps {
  block: BlockNode;
}

type DialogMode = 'save' | 'convert' | null;

/**
 * Property-panel actions for the spec's "Save as Reusable" / "Convert" /
 * "Detach Copy" flows (§2/§6) — placed here (not the toolbar) since it's
 * already scoped to exactly the selected block, `PropertyPanel` already
 * has it in scope, and it naturally disappears along with the rest of the
 * panel when nothing is selected.
 *
 * - A `reusable-block` reference shows only "Detach copy": resolve the
 *   referenced block, clone it with fresh ids, and replace the reference
 *   node with the resolved (now independently editable) subtree.
 * - Any other block shows "Save as reusable" (no tree change) and
 *   "Convert to reusable" (replaces the block in place with a reference
 *   to what was just saved) — both open the same dialog, differing only
 *   in what happens on success.
 */
export function ReusableBlockActions({ block }: ReusableBlockActionsProps) {
  const { replaceBlockById } = useEditorActions();
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [detachConfirmOpen, setDetachConfirmOpen] = useState(false);
  const [isDetaching, setIsDetaching] = useState(false);

  if (block.type === 'reusable-block') {
    const reusableBlockId =
      typeof block.data.reusableBlockId === 'string' ? block.data.reusableBlockId : '';

    async function handleDetach() {
      setIsDetaching(true);
      try {
        const resolved = await reusableBlocksApi.get(reusableBlockId);
        const detached = cloneWithFreshIds({
          id: 'placeholder',
          type: resolved.blockType,
          data: resolved.data as Record<string, unknown>,
          children: resolved.children ?? undefined,
        });
        replaceBlockById(block.id, { ...detached, meta: block.meta });
        toast.success('Detached — this is now an independent copy.');
      } catch (error) {
        toast.error(isApiError(error) ? error.message : 'Could not detach this block.');
      } finally {
        setIsDetaching(false);
      }
    }

    return (
      <>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setDetachConfirmOpen(true)}
          disabled={!reusableBlockId}
        >
          Detach copy
        </Button>
        <ConfirmDialog
          open={detachConfirmOpen}
          onOpenChange={setDetachConfirmOpen}
          title="Detach copy"
          description="This creates an independent, editable copy — it will no longer stay in sync with the reusable block library."
          confirmLabel="Detach"
          onConfirm={handleDetach}
        />
        {isDetaching ? <span className="sr-only">Detaching…</span> : null}
      </>
    );
  }

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => setDialogMode('save')}>
        Save as reusable
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={() => setDialogMode('convert')}>
        Convert to reusable
      </Button>

      {/* Mounted only while actually open — `SaveAsReusableBlockDialog`
          owns a `useMutation` hook internally, which needs a
          `QueryClientProvider` ancestor; every other selected-block
          render path (the common case) shouldn't have to carry that
          requirement just because this action exists. */}
      {dialogMode !== null ? (
        <SaveAsReusableBlockDialog
          open
          onOpenChange={(open) => !open && setDialogMode(null)}
          sourceBlock={{ type: block.type, data: block.data, children: block.children }}
          onSaved={(created: ReusableBlockSummary) => {
            if (dialogMode === 'convert') {
              replaceBlockById(block.id, {
                id: generateId(),
                type: 'reusable-block',
                data: { reusableBlockId: created.id },
                meta: block.meta,
              });
            }
            setDialogMode(null);
          }}
        />
      ) : null}
    </>
  );
}
