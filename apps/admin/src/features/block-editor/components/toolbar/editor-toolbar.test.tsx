import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithEditor } from '../../test-utils/render-with-editor';
import { EditorToolbar } from './editor-toolbar';
import { BlockCanvas } from '../canvas/block-canvas';
import type { BlockNode } from '../../types/block.types';

function renderToolbarWithCanvas(initialBlocks: BlockNode[] = []) {
  return renderWithEditor(
    <>
      <EditorToolbar />
      <BlockCanvas />
    </>,
    initialBlocks
  );
}

describe('EditorToolbar', () => {
  it('disables undo/redo/copy/paste/duplicate/delete when there is nothing to act on', () => {
    renderToolbarWithCanvas([]);
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Redo' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Copy selected block' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Paste' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Duplicate selected block' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete selected block' })).toBeDisabled();
  });

  it('inserts a block via the toolbar picker and enables Undo', async () => {
    renderToolbarWithCanvas([]);
    await userEvent.click(screen.getAllByRole('button', { name: 'Add block' })[0]);
    await userEvent.click(screen.getByRole('menuitem', { name: /Paragraph/ }));
    expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled();
  });

  it('undo reverts the last insert', async () => {
    renderToolbarWithCanvas([]);
    await userEvent.click(screen.getAllByRole('button', { name: 'Add block' })[0]);
    await userEvent.click(screen.getByRole('menuitem', { name: /Divider/ }));
    expect(screen.getByTestId(/block-row-/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(screen.getByText('No blocks yet — add one to get started.')).toBeInTheDocument();
  });

  it('enables copy/duplicate/delete once a block is selected', async () => {
    const block: BlockNode = { id: 'b1', type: 'paragraph', data: { text: 'hi' } };
    renderToolbarWithCanvas([block]);
    await userEvent.click(screen.getByTestId('block-row-b1'));
    expect(screen.getByRole('button', { name: 'Copy selected block' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Duplicate selected block' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Delete selected block' })).toBeEnabled();
  });

  it('copy then paste enables via clipboard state and inserts a fresh-id clone', async () => {
    const block: BlockNode = { id: 'b1', type: 'paragraph', data: { text: 'hi' } };
    renderToolbarWithCanvas([block]);
    await userEvent.click(screen.getByTestId('block-row-b1'));
    await userEvent.click(screen.getByRole('button', { name: 'Copy selected block' }));
    expect(screen.getByRole('button', { name: 'Paste' })).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: 'Paste' }));
    expect(screen.getAllByText('Paragraph')).toHaveLength(2);
  });
});
