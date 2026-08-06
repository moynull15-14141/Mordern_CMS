import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { CreateReusableBlockPageContent } from './create-reusable-block-page-content';
import { reusableBlocksApi } from '../services/reusable-blocks.api';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/reusable-blocks.api', () => ({ reusableBlocksApi: { create: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));
// The embedded <BlockEditor>'s "Reusable block" picker field fetches the
// library in the background even though these tests never select it —
// mocked defensively, matching block-editor.test.tsx's own precedent.
vi.mock('@/features/block-editor/hooks/use-reusable-blocks', () => ({
  useReusableBlocks: () => ({ data: { data: [] }, isLoading: false }),
}));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

async function addAParagraphBlock(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getAllByRole('button', { name: 'Add block' })[0]);
  await user.click(screen.getByRole('menuitem', { name: /Paragraph/ }));
}

describe('CreateReusableBlockPageContent', () => {
  it('rejects submitting with no block added yet', async () => {
    const user = userEvent.setup();
    render(<CreateReusableBlockPageContent />, { wrapper: wrapper() });

    await user.type(screen.getByLabelText('Name'), 'Newsletter callout');
    await user.click(screen.getByRole('button', { name: 'Create reusable block' }));

    expect(await screen.findByText('Add a block to save as reusable.')).toBeInTheDocument();
    expect(reusableBlocksApi.create).not.toHaveBeenCalled();
  });

  it('submits the block’s type/data and navigates to the detail page on success', async () => {
    vi.mocked(reusableBlocksApi.create).mockResolvedValue({ id: 'rb-1' } as never);
    const user = userEvent.setup();
    render(<CreateReusableBlockPageContent />, { wrapper: wrapper() });

    await user.type(screen.getByLabelText('Name'), 'Newsletter callout');
    await addAParagraphBlock(user);
    await user.click(screen.getByRole('button', { name: 'Create reusable block' }));

    await waitFor(() =>
      expect(reusableBlocksApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Newsletter callout', blockType: 'paragraph' })
      )
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/reusable-blocks/rb-1'));
  });

  it('sends description/category as undefined when left blank', async () => {
    vi.mocked(reusableBlocksApi.create).mockResolvedValue({ id: 'rb-1' } as never);
    const user = userEvent.setup();
    render(<CreateReusableBlockPageContent />, { wrapper: wrapper() });

    await user.type(screen.getByLabelText('Name'), 'Newsletter callout');
    await addAParagraphBlock(user);
    await user.click(screen.getByRole('button', { name: 'Create reusable block' }));

    await waitFor(() =>
      expect(reusableBlocksApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ description: undefined, category: undefined })
      )
    );
  });
});
