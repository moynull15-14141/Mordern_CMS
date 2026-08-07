import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BlockEditorProvider } from '../../context/block-editor-provider';
import { AddBlockButton } from './add-block-button';
import { useEditorBlocks } from '../../context/use-block-editor';
import { patternsApi } from '@/features/patterns/services/patterns.api';
import type { BlockNode } from '../../types/block.types';

vi.mock('@/features/patterns/services/patterns.api', () => ({
  patternsApi: { get: vi.fn() },
}));
vi.mock('@/features/patterns/hooks/use-patterns', () => ({
  usePatterns: () => ({
    data: {
      data: [
        {
          id: 'pattern-1',
          name: 'Hero section',
          category: 'Hero',
          tags: ['landing'],
          blockCount: 1,
          status: 'ACTIVE',
        },
      ],
      meta: {},
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));
vi.mock('@/features/patterns/hooks/use-pattern-favorites', () => ({
  useFavoritePatterns: () => ({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

function DumpBlocks() {
  const blocks = useEditorBlocks();
  return <div data-testid="dump">{JSON.stringify(blocks)}</div>;
}

function Harness({ children }: { children: ReactNode }) {
  const [blocks, setBlocks] = useState<BlockNode[]>([]);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={queryClient}>
      <BlockEditorProvider value={blocks} onChange={setBlocks}>
        {children}
        <DumpBlocks />
      </BlockEditorProvider>
    </QueryClientProvider>
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('AddBlockButton', () => {
  it('opens the Pattern Picker from the "Patterns…" menu entry and inserts the fetched pattern as a detached, stamped copy', async () => {
    vi.mocked(patternsApi.get).mockResolvedValue({
      id: 'pattern-1',
      name: 'Hero section',
      body: { blocks: [{ id: 'source-root', type: 'container', data: {}, children: [] }] },
    } as never);

    render(
      <Harness>
        <AddBlockButton trigger={<Button>Add block</Button>} parentId={null} index={0} />
      </Harness>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Add block' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Patterns…' }));

    expect(await screen.findByText('Insert pattern')).toBeInTheDocument();
    await userEvent.click(await screen.findByRole('button', { name: 'Insert' }));

    await waitFor(() => expect(patternsApi.get).toHaveBeenCalledWith('pattern-1'));

    const dumped = await screen.findByTestId('dump');
    const inserted = JSON.parse(dumped.textContent ?? '[]') as BlockNode[];
    expect(inserted).toHaveLength(1);
    // Fresh id — never the source pattern's own block id (a detached copy).
    expect(inserted[0].id).not.toBe('source-root');
    // Stamped with the "inserted from" provenance marker.
    expect(inserted[0].meta?.patternOrigin).toEqual({ patternId: 'pattern-1' });
  });
});
