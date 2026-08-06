import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { BlockEditorProvider } from '../context/block-editor-provider';
import type { BlockNode } from '../types/block.types';

/** Test-only harness — a real, stateful `value`/`onChange` round-trip
 * (not a fixed prop that never updates), matching how the real
 * `BlockEditor` consumer wires it. Every component test that needs to be
 * inside a `<BlockEditorProvider>` uses this instead of duplicating the
 * boilerplate. */
function Harness({ initialBlocks, children }: { initialBlocks: BlockNode[]; children: ReactNode }) {
  const [blocks, setBlocks] = useState(initialBlocks);
  return (
    <BlockEditorProvider value={blocks} onChange={setBlocks}>
      {children}
    </BlockEditorProvider>
  );
}

export function renderWithEditor(ui: ReactNode, initialBlocks: BlockNode[] = []) {
  return render(<Harness initialBlocks={initialBlocks}>{ui}</Harness>);
}
