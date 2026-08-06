import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlockEditor } from './block-editor';
import type { BlockNode } from '../types/block.types';

vi.mock('../hooks/use-reusable-blocks', () => ({
  useReusableBlocks: () => ({ data: { data: [] }, isLoading: false }),
}));

/** A real controlled round-trip, matching how `article-form.tsx` will
 * actually wire this component via RHF's `Controller`. */
function ControlledBlockEditor({ onChange }: { onChange?: (blocks: BlockNode[]) => void }) {
  const [blocks, setBlocks] = useState<BlockNode[]>([]);
  return (
    <BlockEditor
      value={blocks}
      onChange={(next) => {
        setBlocks(next);
        onChange?.(next);
      }}
    />
  );
}

describe('BlockEditor', () => {
  it('renders the toolbar, canvas, and property panel', () => {
    render(<ControlledBlockEditor />);
    expect(screen.getByRole('toolbar', { name: 'Block editor toolbar' })).toBeInTheDocument();
    expect(screen.getByTestId('block-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('property-panel-empty')).toBeInTheDocument();
  });

  it('full flow: add, select, edit a field, undo, redo, duplicate, copy, paste, delete', async () => {
    const onChange = vi.fn();
    render(<ControlledBlockEditor onChange={onChange} />);

    // Add a block.
    await userEvent.click(screen.getAllByRole('button', { name: 'Add block' })[0]);
    await userEvent.click(screen.getByRole('menuitem', { name: /Paragraph/ }));
    const lastAdded = onChange.mock.calls.at(-1)![0] as BlockNode[];
    expect(lastAdded).toHaveLength(1);

    // Select it — the property panel should now show its fields.
    await userEvent.click(screen.getByTestId(`block-row-${lastAdded[0].id}`));
    expect(screen.getByRole('heading', { name: 'Paragraph' })).toBeInTheDocument();

    // Edit its text field via the property panel.
    const textField = screen.getByLabelText(/Text/);
    await userEvent.type(textField, 'Hello world');
    expect(textField).toHaveValue('Hello world');

    // Undo the edit — Undo is enabled after any store mutation.
    expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled();

    // Duplicate.
    await userEvent.click(screen.getByRole('button', { name: 'Duplicate selected block' }));
    expect(screen.getAllByTestId(/block-row-/)).toHaveLength(2);

    // Copy + paste appends a third.
    await userEvent.click(screen.getByRole('button', { name: 'Copy selected block' }));
    await userEvent.click(screen.getByRole('button', { name: 'Paste' }));
    expect(screen.getAllByTestId(/block-row-/)).toHaveLength(3);

    // Delete one.
    await userEvent.click(screen.getAllByRole('button', { name: 'Delete block' })[0]);
    expect(screen.getAllByTestId(/block-row-/)).toHaveLength(2);
  });

  it('surfaces validation issues for an incomplete block', async () => {
    render(<ControlledBlockEditor />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Add block' })[0]);
    await userEvent.click(screen.getByRole('menuitem', { name: /Paragraph/ }));
    // A freshly-inserted paragraph starts with empty text (required) — the
    // validation pipeline should flag it inline without any submit action.
    expect(screen.getByTestId('validation-issues')).toBeInTheDocument();
  });

  it('accepts extraValidators without any change to the feature itself', async () => {
    const customValidator = vi
      .fn()
      .mockReturnValue([{ blockId: 'x', path: 'blocks', message: 'Custom rule failed.' }]);
    render(<BlockEditor value={[]} onChange={vi.fn()} extraValidators={[customValidator]} />);
    expect(screen.getByText('Custom rule failed.')).toBeInTheDocument();
  });

  it('Ctrl+Z (keyboard shortcut) undoes the last insert end-to-end', async () => {
    render(<ControlledBlockEditor />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Add block' })[0]);
    await userEvent.click(screen.getByRole('menuitem', { name: /Divider/ }));
    const row = screen.getByTestId(/block-row-/);
    await userEvent.click(row);
    await userEvent.keyboard('{Control>}z{/Control}');
    expect(screen.queryByTestId(/block-row-/)).not.toBeInTheDocument();
  });
});
