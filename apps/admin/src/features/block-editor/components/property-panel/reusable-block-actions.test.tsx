import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BlockEditorProvider } from '../../context/block-editor-provider';
import { useEditorBlocks } from '../../context/use-block-editor';
import { ReusableBlockActions } from './reusable-block-actions';
import { reusableBlocksApi } from '../../api/reusable-blocks.api';
import type { BlockNode } from '../../types/block.types';

vi.mock('../../api/reusable-blocks.api', () => ({
  reusableBlocksApi: { create: vi.fn(), get: vi.fn() },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

/** Combines the QueryClientProvider `SaveAsReusableBlockDialog`'s
 * mutation hook needs with a real, stateful `BlockEditorProvider` (so
 * `replaceBlockById` visibly mutates the tree) — `renderWithEditor` alone
 * doesn't wrap QueryClientProvider, and no test elsewhere in this feature
 * needed both until this one. */
function renderWithProviders(initialBlocks: BlockNode[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Harness() {
    const [blocks, setBlocks] = useState(initialBlocks);
    return (
      <QueryClientProvider client={queryClient}>
        <BlockEditorProvider value={blocks} onChange={setBlocks}>
          <BlocksProbe />
          <ReusableBlockActions block={blocks[0]} />
        </BlockEditorProvider>
      </QueryClientProvider>
    );
  }

  return render(<Harness />);
}

function BlocksProbe() {
  const blocks = useEditorBlocks();
  return <pre data-testid="blocks-json">{JSON.stringify(blocks)}</pre>;
}

describe('ReusableBlockActions', () => {
  it('shows "Save as reusable" and "Convert to reusable" for a normal block', () => {
    renderWithProviders([{ id: 'a', type: 'paragraph', data: { text: 'hi' } }]);
    expect(screen.getByRole('button', { name: 'Save as reusable' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Convert to reusable' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Detach copy' })).not.toBeInTheDocument();
  });

  it('shows only "Detach copy" for a reusable-block reference', () => {
    renderWithProviders([{ id: 'a', type: 'reusable-block', data: { reusableBlockId: 'rb-1' } }]);
    expect(screen.getByRole('button', { name: 'Detach copy' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save as reusable' })).not.toBeInTheDocument();
  });

  it('"Save as reusable" does not change the tree — the block stays as-is', async () => {
    vi.mocked(reusableBlocksApi.create).mockResolvedValue({
      id: 'rb-1',
      name: 'My block',
    } as never);
    const user = userEvent.setup();
    renderWithProviders([{ id: 'a', type: 'paragraph', data: { text: 'hi' } }]);

    await user.click(screen.getByRole('button', { name: 'Save as reusable' }));
    await user.type(screen.getByLabelText('Name'), 'My block');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(reusableBlocksApi.create).toHaveBeenCalled());
    const blocks = JSON.parse(screen.getByTestId('blocks-json').textContent ?? '[]');
    expect(blocks).toEqual([{ id: 'a', type: 'paragraph', data: { text: 'hi' } }]);
  });

  it('"Convert to reusable" replaces the block with a reusable-block reference to the saved block', async () => {
    vi.mocked(reusableBlocksApi.create).mockResolvedValue({
      id: 'rb-1',
      name: 'My block',
    } as never);
    const user = userEvent.setup();
    renderWithProviders([{ id: 'a', type: 'paragraph', data: { text: 'hi' } }]);

    await user.click(screen.getByRole('button', { name: 'Convert to reusable' }));
    await user.type(screen.getByLabelText('Name'), 'My block');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      const blocks = JSON.parse(screen.getByTestId('blocks-json').textContent ?? '[]');
      expect(blocks).toEqual([
        { id: expect.any(String), type: 'reusable-block', data: { reusableBlockId: 'rb-1' } },
      ]);
    });
  });

  it('"Detach copy" resolves the reference and replaces it with a fresh, independent subtree', async () => {
    vi.mocked(reusableBlocksApi.get).mockResolvedValue({
      id: 'rb-1',
      name: 'X',
      blockType: 'paragraph',
      data: { text: 'resolved text' },
      children: null,
    } as never);
    const user = userEvent.setup();
    renderWithProviders([{ id: 'a', type: 'reusable-block', data: { reusableBlockId: 'rb-1' } }]);

    await user.click(screen.getByRole('button', { name: 'Detach copy' }));
    await user.click(screen.getByRole('button', { name: 'Detach' }));

    await waitFor(() => {
      const blocks = JSON.parse(screen.getByTestId('blocks-json').textContent ?? '[]');
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('paragraph');
      expect(blocks[0].data).toEqual({ text: 'resolved text' });
      expect(blocks[0].id).not.toBe('a');
    });
  });
});
