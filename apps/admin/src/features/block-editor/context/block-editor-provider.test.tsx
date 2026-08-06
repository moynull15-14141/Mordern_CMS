import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlockEditorProvider } from './block-editor-provider';
import { useEditorActions, useEditorBlocks } from './use-block-editor';
import type { BlockNode } from '../types/block.types';

/** Reads the store through the same public hooks real consumers use, so
 * these tests exercise the provider's sync behavior rather than reaching
 * into store internals. */
function BlocksProbe() {
  const blocks = useEditorBlocks();
  const { insertBlock } = useEditorActions();
  return (
    <div>
      <span data-testid="count">{blocks.length}</span>
      <span data-testid="ids">{blocks.map((b) => b.id).join(',')}</span>
      <button onClick={() => insertBlock('paragraph', null, blocks.length)}>Insert</button>
    </div>
  );
}

/** Regression harness for the "Maximum update depth exceeded" hydrate
 * loop: a parent that does NOT preserve reference identity for unchanged
 * content — every render hands `BlockEditorProvider` a brand-new array
 * (and brand-new nested objects) with the exact same data, which is
 * exactly what a re-rendering controlled parent can legitimately do. An
 * unrelated `tick` counter forces re-renders that have nothing to do with
 * the block content, the way typing in a sibling form field would. */
function UnstableReferenceHarness({ onChange }: { onChange?: (blocks: BlockNode[]) => void }) {
  const [committed, setCommitted] = useState<BlockNode[]>([
    { id: 'a', type: 'paragraph', data: { text: 'hi' } },
  ]);
  const [tick, setTick] = useState(0);

  return (
    <div>
      <button onClick={() => setTick((t) => t + 1)}>Re-render</button>
      <span data-testid="tick">{tick}</span>
      <BlockEditorProvider
        value={structuredClone(committed)}
        onChange={(next) => {
          setCommitted(next);
          onChange?.(next);
        }}
      >
        <BlocksProbe />
      </BlockEditorProvider>
    </div>
  );
}

describe('BlockEditorProvider — hydrate loop regression', () => {
  it('does not throw "Maximum update depth exceeded" when the parent hands back a new-but-equal-content value on every render', async () => {
    const user = userEvent.setup();
    render(<UnstableReferenceHarness />);

    expect(screen.getByTestId('count')).toHaveTextContent('1');

    // Each click re-renders the parent, which recomputes `value` as a
    // fresh (structurally identical) array/object tree. Before the fix,
    // the reference-only equality check in the hydrate effect treated
    // every one of these as "new external data," hydrated, which re-fired
    // onChange, which produced another new-but-equal value — looping
    // synchronously until React's re-render cap threw.
    for (let i = 0; i < 5; i++) {
      await user.click(screen.getByRole('button', { name: 'Re-render' }));
    }

    expect(screen.getByTestId('tick')).toHaveTextContent('5');
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('does not re-hydrate (and so does not reset undo history) for a new-but-equal-content value', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<UnstableReferenceHarness onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Insert' }));
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    onChange.mockClear();

    // A re-render that only touches unrelated state must not echo a
    // hydrate-driven onChange back out — a real hydrate (even a no-op
    // content-wise one) would call onChange again here.
    await user.click(screen.getByRole('button', { name: 'Re-render' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });

  it('still hydrates on a genuine external content change', async () => {
    const user = userEvent.setup();

    function ExternalSwapHarness() {
      const [value, setValue] = useState<BlockNode[]>([{ id: 'a', type: 'paragraph', data: {} }]);
      return (
        <div>
          <button
            onClick={() => setValue([{ id: 'external', type: 'heading', data: { text: 'x' } }])}
          >
            Load different document
          </button>
          <BlockEditorProvider value={value} onChange={setValue}>
            <BlocksProbe />
          </BlockEditorProvider>
        </div>
      );
    }

    render(<ExternalSwapHarness />);
    expect(screen.getByTestId('ids')).toHaveTextContent('a');
    await user.click(screen.getByRole('button', { name: 'Load different document' }));
    expect(screen.getByTestId('ids')).toHaveTextContent('external');
  });
});
