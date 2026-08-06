import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithEditor } from '../../test-utils/render-with-editor';
import { useEditorActions } from '../../context/use-block-editor';
import { PropertyPanel } from './property-panel';
import type { BlockNode } from '../../types/block.types';

vi.mock('../../hooks/use-reusable-blocks', () => ({
  useReusableBlocks: () => ({ data: { data: [] }, isLoading: false }),
}));

function SelectOnMount({ id }: { id: string }) {
  const { selectBlock } = useEditorActions();
  useEffect(() => selectBlock(id), [id, selectBlock]);
  return null;
}

describe('PropertyPanel', () => {
  it('shows a placeholder when nothing is selected', () => {
    renderWithEditor(<PropertyPanel />);
    expect(screen.getByTestId('property-panel-empty')).toBeInTheDocument();
  });

  it('renders the registered fields for the selected block and edits update the store', async () => {
    const blocks: BlockNode[] = [{ id: 'b1', type: 'paragraph', data: { text: 'Hello' } }];
    renderWithEditor(
      <>
        <SelectOnMount id="b1" />
        <PropertyPanel />
      </>,
      blocks
    );

    expect(screen.getByRole('heading', { name: 'Paragraph' })).toBeInTheDocument();
    const input = screen.getByDisplayValue('Hello');
    await userEvent.type(input, '!');
    expect(input).toHaveValue('Hello!');
  });

  it('shows a message for a block type with no editable fields (divider)', () => {
    renderWithEditor(
      <>
        <SelectOnMount id="b1" />
        <PropertyPanel />
      </>,
      [{ id: 'b1', type: 'divider', data: {} }]
    );
    expect(screen.getByText('This block has no editable properties.')).toBeInTheDocument();
  });

  it('shows an unknown-type message for an unregistered block type', () => {
    renderWithEditor(
      <>
        <SelectOnMount id="b1" />
        <PropertyPanel />
      </>,
      [{ id: 'b1', type: 'not-a-real-type', data: {} }]
    );
    expect(screen.getByTestId('property-panel-unknown-type')).toBeInTheDocument();
  });

  it('renders the responsive visibility checkboxes for every block type', () => {
    renderWithEditor(
      <>
        <SelectOnMount id="b1" />
        <PropertyPanel />
      </>,
      [{ id: 'b1', type: 'paragraph', data: { text: 'x' } }]
    );
    expect(screen.getByLabelText('Hide on mobile')).toBeInTheDocument();
    expect(screen.getByLabelText('Hide on tablet')).toBeInTheDocument();
    expect(screen.getByLabelText('Hide on desktop')).toBeInTheDocument();
  });

  it('shows "Save as reusable"/"Convert to reusable" for a normal selected block', () => {
    renderWithEditor(
      <>
        <SelectOnMount id="b1" />
        <PropertyPanel />
      </>,
      [{ id: 'b1', type: 'paragraph', data: { text: 'x' } }]
    );
    expect(screen.getByRole('button', { name: 'Save as reusable' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Convert to reusable' })).toBeInTheDocument();
  });

  it('shows "Detach copy" instead for a selected reusable-block reference', () => {
    renderWithEditor(
      <>
        <SelectOnMount id="b1" />
        <PropertyPanel />
      </>,
      [{ id: 'b1', type: 'reusable-block', data: { reusableBlockId: 'rb-1' } }]
    );
    expect(screen.getByRole('button', { name: 'Detach copy' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save as reusable' })).not.toBeInTheDocument();
  });
});
