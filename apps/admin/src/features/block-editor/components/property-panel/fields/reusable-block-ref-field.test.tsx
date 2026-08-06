import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ReusableBlockRefField } from './reusable-block-ref-field';
import { reusableBlocksApi } from '../../../api/reusable-blocks.api';

vi.mock('../../../api/reusable-blocks.api', () => ({ reusableBlocksApi: { list: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('ReusableBlockRefField', () => {
  it('lists reusable blocks fetched from the real endpoint and calls onChange on selection', async () => {
    vi.mocked(reusableBlocksApi.list).mockResolvedValue({
      data: [
        {
          id: 'rb-1',
          name: 'Newsletter CTA',
          blockType: 'callout',
          data: {},
          createdAt: '',
          updatedAt: '',
          deletedAt: null,
        },
      ],
      meta: {},
    } as never);

    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ReusableBlockRefField
        descriptor={{ key: 'reusableBlockId', label: 'Reusable block', kind: 'reusable-block-ref' }}
        value=""
        onChange={onChange}
      />,
      { wrapper: wrapper() }
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Newsletter CTA' }));
    expect(onChange).toHaveBeenCalledWith('rb-1');
  });

  it('re-fetches when the search text changes', async () => {
    vi.mocked(reusableBlocksApi.list).mockResolvedValue({ data: [], meta: {} } as never);
    const user = userEvent.setup();
    render(
      <ReusableBlockRefField
        descriptor={{ key: 'reusableBlockId', label: 'Reusable block', kind: 'reusable-block-ref' }}
        value=""
        onChange={vi.fn()}
      />,
      { wrapper: wrapper() }
    );

    await user.type(screen.getByPlaceholderText('Search reusable blocks…'), 'news');
    expect(reusableBlocksApi.list).toHaveBeenCalledWith('news');
  });
});
