import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { EditReusableBlockPageContent } from './edit-reusable-block-page-content';
import { reusableBlocksApi } from '../services/reusable-blocks.api';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/reusable-blocks.api', () => ({
  reusableBlocksApi: { get: vi.fn(), update: vi.fn() },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));
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

const targetBlock = {
  id: 'rb-1',
  name: 'Newsletter callout',
  description: 'A callout.',
  category: 'Marketing',
  blockType: 'callout',
  data: { title: '', text: 'Subscribe today', tone: 'info' },
  children: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

describe('EditReusableBlockPageContent', () => {
  it('loads the block by id and pre-fills the form, including its embedded block content', async () => {
    vi.mocked(reusableBlocksApi.get).mockResolvedValue(targetBlock);
    render(<EditReusableBlockPageContent blockId="rb-1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue('Newsletter callout'));
    expect(screen.getByLabelText('Category')).toHaveValue('Marketing');
    expect(reusableBlocksApi.get).toHaveBeenCalledWith('rb-1');
  });

  it('navigates to the detail page without a confirm dialog when Cancel is clicked and the form is clean', async () => {
    vi.mocked(reusableBlocksApi.get).mockResolvedValue(targetBlock);
    const user = userEvent.setup();
    render(<EditReusableBlockPageContent blockId="rb-1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Name')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(pushMock).toHaveBeenCalledWith('/reusable-blocks/rb-1');
    expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument();
  });

  it('shows a discard-changes confirmation when Cancel is clicked with unsaved edits', async () => {
    vi.mocked(reusableBlocksApi.get).mockResolvedValue(targetBlock);
    const user = userEvent.setup();
    render(<EditReusableBlockPageContent blockId="rb-1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Name')).toBeInTheDocument());
    await user.type(screen.getByLabelText('Name'), '!');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(await screen.findByText('Discard changes?')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalledWith('/reusable-blocks/rb-1');
  });

  it('saves changes and navigates to the detail page on success', async () => {
    vi.mocked(reusableBlocksApi.get).mockResolvedValue(targetBlock);
    vi.mocked(reusableBlocksApi.update).mockResolvedValue({ ...targetBlock, name: 'New Name' });
    const user = userEvent.setup();
    render(<EditReusableBlockPageContent blockId="rb-1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Name')).toBeInTheDocument());
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'New Name');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(reusableBlocksApi.update).toHaveBeenCalledWith(
        'rb-1',
        expect.objectContaining({ name: 'New Name' })
      )
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/reusable-blocks/rb-1'));
  });
});
