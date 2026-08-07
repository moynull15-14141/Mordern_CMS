import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { BlockEditorProvider, useEditorBlocks } from '@/features/block-editor';
import type { BlockNode } from '@/features/block-editor';
import { StructurePanel } from './structure-panel';

function Harness({ initialBlocks }: { initialBlocks: BlockNode[] }) {
  const [blocks, setBlocks] = useState(initialBlocks);
  return (
    <BlockEditorProvider value={blocks} onChange={setBlocks}>
      <StructurePanel />
      <Dump />
    </BlockEditorProvider>
  );
}

function Dump() {
  const blocks = useEditorBlocks();
  return <div data-testid="dump">{JSON.stringify(blocks.map((b) => b.id))}</div>;
}

describe('StructurePanel', () => {
  it('shows an empty state with no blocks', () => {
    render(<Harness initialBlocks={[]} />);
    expect(screen.getByTestId('structure-panel-empty')).toBeInTheDocument();
  });

  it('renders a row per top-level block, and nested rows for a container', () => {
    render(
      <Harness
        initialBlocks={[
          { id: 'a', type: 'paragraph', data: {} },
          {
            id: 'b',
            type: 'container',
            data: {},
            children: [{ id: 'c', type: 'paragraph', data: {} }],
          },
        ]}
      />
    );
    expect(screen.getByTestId('structure-row-a')).toBeInTheDocument();
    expect(screen.getByTestId('structure-row-b')).toBeInTheDocument();
    expect(screen.getByTestId('structure-row-c')).toBeInTheDocument();
  });

  it('clicking a row selects it', async () => {
    render(<Harness initialBlocks={[{ id: 'a', type: 'paragraph', data: {} }]} />);
    await userEvent.click(screen.getByTestId('structure-row-a'));
    expect(screen.getByTestId('structure-row-a')).toHaveAttribute('aria-pressed', 'true');
  });

  it('Move down then Move up round-trips the order', async () => {
    render(
      <Harness
        initialBlocks={[
          { id: 'a', type: 'paragraph', data: {} },
          { id: 'b', type: 'paragraph', data: {} },
        ]}
      />
    );
    await userEvent.click(screen.getAllByLabelText('Move down')[0]);
    expect(screen.getByTestId('dump')).toHaveTextContent('["b","a"]');

    await userEvent.click(screen.getAllByLabelText('Move up')[1]);
    expect(screen.getByTestId('dump')).toHaveTextContent('["a","b"]');
  });

  it('Duplicate adds a fresh-id copy, Delete removes a block', async () => {
    render(<Harness initialBlocks={[{ id: 'a', type: 'paragraph', data: {} }]} />);

    await userEvent.click(screen.getByLabelText('Duplicate'));
    expect(JSON.parse(screen.getByTestId('dump').textContent ?? '[]')).toHaveLength(2);

    await userEvent.click(screen.getAllByLabelText('Delete')[0]);
    expect(JSON.parse(screen.getByTestId('dump').textContent ?? '[]')).toHaveLength(1);
  });

  it('collapsing a container hides its children, expanding shows them again', async () => {
    render(
      <Harness
        initialBlocks={[
          {
            id: 'b',
            type: 'container',
            data: {},
            children: [{ id: 'c', type: 'paragraph', data: {} }],
          },
        ]}
      />
    );
    expect(screen.getByTestId('structure-row-c')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Collapse'));
    expect(screen.queryByTestId('structure-row-c')).not.toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Expand'));
    expect(screen.getByTestId('structure-row-c')).toBeInTheDocument();
  });
});
