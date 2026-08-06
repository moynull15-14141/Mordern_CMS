import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithEditor } from '../../test-utils/render-with-editor';
import { BlockCanvas } from './block-canvas';
import type { BlockNode } from '../../types/block.types';

describe('BlockCanvas', () => {
  it('shows an empty-state message with no blocks', () => {
    renderWithEditor(<BlockCanvas />, []);
    expect(screen.getByText('No blocks yet — add one to get started.')).toBeInTheDocument();
  });

  it('renders one row per top-level block', () => {
    const blocks: BlockNode[] = [
      { id: 'a', type: 'paragraph', data: {} },
      { id: 'b', type: 'divider', data: {} },
    ];
    renderWithEditor(<BlockCanvas />, blocks);
    expect(screen.getByTestId('block-row-a')).toBeInTheDocument();
    expect(screen.getByTestId('block-row-b')).toBeInTheDocument();
  });

  it('inserts a new block via the "Add block" picker', async () => {
    renderWithEditor(<BlockCanvas />, []);
    await userEvent.click(screen.getByRole('button', { name: 'Add block' }));
    await userEvent.click(screen.getByRole('menuitem', { name: /Paragraph/ }));
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
    expect(screen.queryByText('No blocks yet — add one to get started.')).not.toBeInTheDocument();
  });
});
