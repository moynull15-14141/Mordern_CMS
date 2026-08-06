import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { SaveAsReusableBlockDialog } from './save-as-reusable-block-dialog';
import { reusableBlocksApi } from '../../api/reusable-blocks.api';

vi.mock('../../api/reusable-blocks.api', () => ({ reusableBlocksApi: { create: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

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

const sourceBlock = { type: 'callout', data: { text: 'Subscribe' }, children: undefined };

describe('SaveAsReusableBlockDialog', () => {
  it('submits the name/description/category plus the source block’s type/data/children', async () => {
    vi.mocked(reusableBlocksApi.create).mockResolvedValue({
      id: 'rb-1',
      name: 'Newsletter callout',
    } as never);
    const onSaved = vi.fn();
    const user = userEvent.setup();
    render(
      <SaveAsReusableBlockDialog
        open
        onOpenChange={vi.fn()}
        sourceBlock={sourceBlock}
        onSaved={onSaved}
      />,
      { wrapper: wrapper() }
    );

    await user.type(screen.getByLabelText('Name'), 'Newsletter callout');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(reusableBlocksApi.create).toHaveBeenCalledWith({
        name: 'Newsletter callout',
        description: undefined,
        category: undefined,
        blockType: 'callout',
        data: { text: 'Subscribe' },
        children: undefined,
      })
    );
    await waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith({ id: 'rb-1', name: 'Newsletter callout' })
    );
  });

  it('rejects a name shorter than 2 characters', async () => {
    const user = userEvent.setup();
    render(
      <SaveAsReusableBlockDialog
        open
        onOpenChange={vi.fn()}
        sourceBlock={sourceBlock}
        onSaved={vi.fn()}
      />,
      { wrapper: wrapper() }
    );

    await user.type(screen.getByLabelText('Name'), 'a');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Must be at least 2 characters.')).toBeInTheDocument();
    expect(reusableBlocksApi.create).not.toHaveBeenCalled();
  });

  it('shows an inline error and does not call onSaved when the API call fails', async () => {
    vi.mocked(reusableBlocksApi.create).mockRejectedValue(new Error('boom'));
    const onSaved = vi.fn();
    const user = userEvent.setup();
    render(
      <SaveAsReusableBlockDialog
        open
        onOpenChange={vi.fn()}
        sourceBlock={sourceBlock}
        onSaved={onSaved}
      />,
      { wrapper: wrapper() }
    );

    await user.type(screen.getByLabelText('Name'), 'Newsletter callout');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
  });
});
