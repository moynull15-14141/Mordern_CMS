import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ReusableBlockPickerDialog } from './reusable-block-picker-dialog';
import { reusableBlocksApi } from '../../api/reusable-blocks.api';

vi.mock('../../api/reusable-blocks.api', () => ({ reusableBlocksApi: { list: vi.fn() } }));

function makeSummary(overrides: Record<string, unknown> = {}) {
  return {
    id: 'rb-1',
    name: 'Newsletter CTA',
    description: null,
    category: null,
    blockType: 'callout',
    data: { text: 'Subscribe' },
    children: null,
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
    ...overrides,
  };
}

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('ReusableBlockPickerDialog', () => {
  it('lists reusable blocks and calls onInsert with the chosen id on Insert', async () => {
    vi.mocked(reusableBlocksApi.list).mockResolvedValue({
      data: [makeSummary()],
      meta: {},
    } as never);
    const onInsert = vi.fn();
    render(<ReusableBlockPickerDialog open onOpenChange={vi.fn()} onInsert={onInsert} />, {
      wrapper: wrapper(),
    });

    expect(await screen.findByText('Newsletter CTA')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Insert' }));

    await waitFor(() => expect(onInsert).toHaveBeenCalledWith('rb-1'));
  });

  it('shows an empty state when nothing matches', async () => {
    vi.mocked(reusableBlocksApi.list).mockResolvedValue({ data: [], meta: {} } as never);
    render(<ReusableBlockPickerDialog open onOpenChange={vi.fn()} onInsert={vi.fn()} />, {
      wrapper: wrapper(),
    });

    expect(await screen.findByText('No reusable blocks found')).toBeInTheDocument();
  });
});
