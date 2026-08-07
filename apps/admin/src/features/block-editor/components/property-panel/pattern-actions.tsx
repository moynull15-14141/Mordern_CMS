'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
// Direct import, not the '@/features/patterns' barrel — see the doc
// comment in `pattern-picker-dialog.tsx` for why (avoids a real runtime
// import cycle through the barrel's page-content re-exports, which embed
// `BlockEditor` themselves).
import { SaveAsPatternDialog } from '@/features/patterns/components/save-as-pattern-dialog';
import type { BlockNode } from '../../types/block.types';

export interface PatternActionsProps {
  block: BlockNode;
}

/**
 * "Save as Pattern" (Milestone 6 spec) — placed next to
 * `ReusableBlockActions` in the property panel, same rationale: already
 * scoped to the selected block, no tree mutation, naturally disappears
 * with the rest of the panel when nothing is selected. Available for any
 * selected block (not just registered "containers") since a Pattern can
 * legitimately be a single non-container block (e.g. a standalone CTA).
 */
export function PatternActions({ block }: PatternActionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        Save as pattern
      </Button>
      {open ? (
        <SaveAsPatternDialog
          open
          onOpenChange={setOpen}
          sourceBlock={{
            id: block.id,
            type: block.type,
            data: block.data,
            children: block.children,
          }}
          onSaved={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
