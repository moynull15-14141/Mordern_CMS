import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { renderWithEditor } from '../../test-utils/render-with-editor';
import { BlockRow } from './block-row';
import { BlockCanvas } from './block-canvas';
import type { BlockNode } from '../../types/block.types';

/** Presentational-only assertions: `BlockRow`'s `block` prop is static
 * once rendered standalone, so this is fine for checking what a given
 * block/children shape renders as, but NOT for actions that mutate the
 * store (delete/duplicate) — those need the store-reactive parent
 * (`BlockCanvas`), see `renderCanvas` below, otherwise the test would be
 * asserting against a prop that never updates, not the real app's
 * reactive rendering. */
function renderRow(block: BlockNode, initialBlocks: BlockNode[]) {
  return renderWithEditor(
    <DndContext>
      <SortableContext items={[block.id, ...(block.children?.map((c) => c.id) ?? [])]}>
        <BlockRow block={block} depth={0} />
      </SortableContext>
    </DndContext>,
    initialBlocks
  );
}

function renderCanvas(initialBlocks: BlockNode[]) {
  return renderWithEditor(<BlockCanvas />, initialBlocks);
}

describe('BlockRow', () => {
  it('renders the block label and selects it on click', async () => {
    const block: BlockNode = { id: 'b1', type: 'paragraph', data: { text: 'hi' } };
    renderRow(block, [block]);
    const row = screen.getByTestId('block-row-b1');
    expect(row).toHaveTextContent('Paragraph');
    expect(row).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(row);
    expect(row).toHaveAttribute('aria-pressed', 'true');
  });

  it('duplicates the block, inserting a fresh-id clone', async () => {
    const block: BlockNode = { id: 'b1', type: 'paragraph', data: { text: 'hi' } };
    renderCanvas([block]);
    await userEvent.click(screen.getByRole('button', { name: 'Duplicate block' }));
    // Both the original row and a new row (different id) should now exist.
    expect(screen.getAllByText('Paragraph')).toHaveLength(2);
  });

  it('deletes the block', async () => {
    const block: BlockNode = { id: 'b1', type: 'paragraph', data: { text: 'hi' } };
    renderCanvas([block]);
    await userEvent.click(screen.getByRole('button', { name: 'Delete block' }));
    expect(screen.queryByTestId('block-row-b1')).not.toBeInTheDocument();
  });

  it('renders nested children for a container block', () => {
    const block: BlockNode = {
      id: 'b1',
      type: 'container',
      data: {},
      children: [{ id: 'c1', type: 'paragraph', data: { text: 'child' } }],
    };
    renderRow(block, [block]);
    expect(screen.getByTestId('block-row-c1')).toBeInTheDocument();
  });

  it('shows an empty drop zone for a container with no children', () => {
    const block: BlockNode = { id: 'b1', type: 'container', data: {} };
    renderRow(block, [block]);
    expect(screen.getByTestId('drop-zone-b1')).toBeInTheDocument();
  });

  it('shows an "add child" action only for container blocks', () => {
    const leaf: BlockNode = { id: 'b1', type: 'paragraph', data: {} };
    const { unmount } = renderRow(leaf, [leaf]);
    expect(screen.queryByRole('button', { name: 'Add child block' })).not.toBeInTheDocument();
    unmount();

    const container: BlockNode = { id: 'b2', type: 'container', data: {} };
    renderRow(container, [container]);
    expect(screen.getByRole('button', { name: 'Add child block' })).toBeInTheDocument();
  });
});
