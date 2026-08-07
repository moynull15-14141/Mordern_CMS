'use client';

import { useState, type ReactNode } from 'react';
import { useEditorActions } from '../../context/use-block-editor';
import { BlockTypePicker } from './block-type-picker';
import { PatternPickerDialog } from './pattern-picker-dialog';
import { ReusableBlockPickerDialog } from './reusable-block-picker-dialog';
import type { BlockNode } from '../../types/block.types';

export interface AddBlockButtonProps {
  trigger: ReactNode;
  parentId: string | null;
  index: number;
}

/**
 * Every "Add block" trigger in the editor (toolbar, canvas footer, a
 * container row's own add-child button) needs the same two things: the
 * registry-driven `BlockTypePicker` and, now, the Pattern Picker — this
 * wraps both so the three call sites stay one-line, and so the "insert a
 * whole pattern" wiring (fetch → clone-with-fresh-ids → insert as one
 * history entry) lives in exactly one place.
 */
export function AddBlockButton({ trigger, parentId, index }: AddBlockButtonProps) {
  const { insertBlock, insertClonedNodes } = useEditorActions();
  const [patternPickerOpen, setPatternPickerOpen] = useState(false);
  const [reusablePickerOpen, setReusablePickerOpen] = useState(false);

  return (
    <>
      <BlockTypePicker
        trigger={trigger}
        onSelect={(type) => insertBlock(type, parentId, index)}
        onSelectPatterns={() => setPatternPickerOpen(true)}
        onSelectReusable={() => setReusablePickerOpen(true)}
      />
      {reusablePickerOpen ? (
        <ReusableBlockPickerDialog
          open
          onOpenChange={setReusablePickerOpen}
          onInsert={(reusableBlockId) => {
            insertClonedNodes(
              [{ id: 'placeholder', type: 'reusable-block', data: { reusableBlockId } }],
              parentId,
              index
            );
          }}
        />
      ) : null}
      {patternPickerOpen ? (
        <PatternPickerDialog
          open
          onOpenChange={setPatternPickerOpen}
          onInsert={(patternId, nodes) => {
            // Stamped on each inserted root only — a soft, non-enforced
            // "inserted from" marker (`PatternsService.getUsages` reads it
            // back), not a live link. It naturally disappears if a user
            // later edits/removes these blocks, which is the point: the
            // insertion is a detached copy from the moment it lands.
            const stamped: BlockNode[] = nodes.map((node) => ({
              ...node,
              meta: { ...node.meta, patternOrigin: { patternId } },
            }));
            insertClonedNodes(stamped, parentId, index);
          }}
        />
      ) : null}
    </>
  );
}
