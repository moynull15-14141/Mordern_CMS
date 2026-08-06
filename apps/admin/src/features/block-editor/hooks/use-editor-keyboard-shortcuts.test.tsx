import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithEditor } from '../test-utils/render-with-editor';
import { useEditorKeyboardShortcuts } from './use-editor-keyboard-shortcuts';
import { BlockCanvas } from '../components/canvas/block-canvas';
import { Input } from '@/components/ui/input';
import type { BlockNode } from '../types/block.types';

function Harness() {
  const ref = useEditorKeyboardShortcuts<HTMLDivElement>();
  return (
    <div ref={ref} data-testid="shortcut-scope">
      <BlockCanvas />
      <Input data-testid="unrelated-input" />
    </div>
  );
}

describe('useEditorKeyboardShortcuts', () => {
  it('Delete removes the selected block', async () => {
    const block: BlockNode = { id: 'b1', type: 'paragraph', data: { text: 'hi' } };
    renderWithEditor(<Harness />, [block]);
    await userEvent.click(screen.getByTestId('block-row-b1'));
    fireEvent.keyDown(screen.getByTestId('block-row-b1'), { key: 'Delete' });
    expect(screen.queryByTestId('block-row-b1')).not.toBeInTheDocument();
  });

  it('Ctrl+D duplicates the selected block', async () => {
    const block: BlockNode = { id: 'b1', type: 'paragraph', data: { text: 'hi' } };
    renderWithEditor(<Harness />, [block]);
    await userEvent.click(screen.getByTestId('block-row-b1'));
    fireEvent.keyDown(screen.getByTestId('block-row-b1'), { key: 'd', ctrlKey: true });
    expect(screen.getAllByText('Paragraph')).toHaveLength(2);
  });

  it('Ctrl+Z undoes the last edit', async () => {
    const block: BlockNode = { id: 'b1', type: 'paragraph', data: { text: 'hi' } };
    renderWithEditor(<Harness />, [block]);
    await userEvent.click(screen.getByTestId('block-row-b1'));
    fireEvent.keyDown(screen.getByTestId('block-row-b1'), { key: 'd', ctrlKey: true });
    expect(screen.getAllByText('Paragraph')).toHaveLength(2);
    fireEvent.keyDown(screen.getByTestId('block-row-b1'), { key: 'z', ctrlKey: true });
    expect(screen.getAllByText('Paragraph')).toHaveLength(1);
  });

  it('Ctrl+C then Ctrl+V copies and pastes the selected block', async () => {
    const block: BlockNode = { id: 'b1', type: 'paragraph', data: { text: 'hi' } };
    renderWithEditor(<Harness />, [block]);
    await userEvent.click(screen.getByTestId('block-row-b1'));
    fireEvent.keyDown(screen.getByTestId('block-row-b1'), { key: 'c', ctrlKey: true });
    fireEvent.keyDown(screen.getByTestId('block-row-b1'), { key: 'v', ctrlKey: true });
    expect(screen.getAllByText('Paragraph')).toHaveLength(2);
  });

  it('does nothing when no block is selected', () => {
    renderWithEditor(<Harness />, []);
    fireEvent.keyDown(screen.getByTestId('shortcut-scope'), { key: 'Delete' });
    expect(screen.getByText('No blocks yet — add one to get started.')).toBeInTheDocument();
  });

  it('ignores shortcuts while focus is on an editable form control', async () => {
    const block: BlockNode = { id: 'b1', type: 'paragraph', data: { text: 'hi' } };
    renderWithEditor(<Harness />, [block]);
    await userEvent.click(screen.getByTestId('block-row-b1'));
    fireEvent.keyDown(screen.getByTestId('unrelated-input'), { key: 'Delete' });
    expect(screen.getByTestId('block-row-b1')).toBeInTheDocument();
  });
});
