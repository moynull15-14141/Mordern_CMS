import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BlockEditorProvider, useEditorBlocks } from '@/features/block-editor';
import type { BlockNode } from '@/features/block-editor';
import { AddPanel } from './add-panel';

vi.mock('@/features/media', () => ({
  MediaPickerDialog: ({ onSelect }: { onSelect: (media: { id: string }) => void }) => (
    <button type="button" onClick={() => onSelect({ id: 'media-1' })}>
      Pick media-1
    </button>
  ),
}));
vi.mock('@/features/patterns/hooks/use-patterns', () => ({
  usePatterns: () => ({ data: undefined }),
}));
vi.mock('@/features/patterns/hooks/use-pattern-favorites', () => ({
  useFavoritePatterns: () => ({ data: undefined }),
}));
vi.mock('@/features/block-editor/hooks/use-reusable-blocks', () => ({
  useReusableBlocks: () => ({ data: undefined, isLoading: false }),
}));

function Dump() {
  const blocks = useEditorBlocks();
  return <div data-testid="dump">{JSON.stringify(blocks)}</div>;
}

function renderPanel(initialBlocks: BlockNode[] = []) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Harness() {
    const [blocks, setBlocks] = useState(initialBlocks);
    return (
      <QueryClientProvider client={queryClient}>
        <BlockEditorProvider value={blocks} onChange={setBlocks}>
          <AddPanel />
          <Dump />
        </BlockEditorProvider>
      </QueryClientProvider>
    );
  }
  return render(<Harness />);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('AddPanel', () => {
  it('Blocks tab: clicking a block type inserts it at the end of the canvas', async () => {
    renderPanel();
    await userEvent.click(screen.getByRole('button', { name: 'Paragraph' }));

    const dumped = JSON.parse(screen.getByTestId('dump').textContent ?? '[]') as BlockNode[];
    expect(dumped).toHaveLength(1);
    expect(dumped[0].type).toBe('paragraph');
  });

  it('Blocks tab: search filters the visible block types', async () => {
    renderPanel();
    await userEvent.click(screen.getByRole('button', { name: 'Blocks' }));
    await userEvent.type(screen.getByPlaceholderText('Search blocks…'), 'Heading');

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Paragraph' })).not.toBeInTheDocument()
    );
    expect(screen.getByRole('button', { name: 'Heading' })).toBeInTheDocument();
  });

  it('Media tab: picking media inserts an image block with the chosen mediaId', async () => {
    renderPanel();
    await userEvent.click(screen.getByRole('button', { name: 'Media' }));
    await userEvent.click(screen.getByRole('button', { name: 'Open media library' }));
    await userEvent.click(screen.getByRole('button', { name: 'Pick media-1' }));

    await waitFor(() => {
      const dumped = JSON.parse(screen.getByTestId('dump').textContent ?? '[]') as BlockNode[];
      expect(dumped).toHaveLength(1);
      expect(dumped[0]).toMatchObject({ type: 'image', data: { mediaId: 'media-1', alt: '' } });
    });
  });
});
