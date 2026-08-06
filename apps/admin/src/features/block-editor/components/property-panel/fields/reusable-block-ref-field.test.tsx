import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ReusableBlockRefField } from './reusable-block-ref-field';
import { reusableBlocksApi } from '../../../api/reusable-blocks.api';
import { recordRecentlyUsedReusableBlock } from '../../../utils/reusable-block-recency';

vi.mock('../../../api/reusable-blocks.api', () => ({ reusableBlocksApi: { list: vi.fn() } }));

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

afterEach(() => {
  vi.clearAllMocks();
});

beforeEach(() => {
  window.localStorage.clear();
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
      data: [makeSummary()],
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
    await user.click(await screen.findByRole('option', { name: /Newsletter CTA/ }));
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

  it('shows an inline content preview alongside each option', async () => {
    vi.mocked(reusableBlocksApi.list).mockResolvedValue({
      data: [makeSummary({ data: { text: 'Subscribe today' } })],
      meta: {},
    } as never);

    const user = userEvent.setup();
    render(
      <ReusableBlockRefField
        descriptor={{ key: 'reusableBlockId', label: 'Reusable block', kind: 'reusable-block-ref' }}
        value=""
        onChange={vi.fn()}
      />,
      { wrapper: wrapper() }
    );

    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByText('Subscribe today')).toBeInTheDocument();
  });

  it('sorts options alphabetically by name', async () => {
    vi.mocked(reusableBlocksApi.list).mockResolvedValue({
      data: [makeSummary({ id: 'rb-2', name: 'Zeta' }), makeSummary({ id: 'rb-1', name: 'Alpha' })],
      meta: {},
    } as never);

    const user = userEvent.setup();
    render(
      <ReusableBlockRefField
        descriptor={{ key: 'reusableBlockId', label: 'Reusable block', kind: 'reusable-block-ref' }}
        value=""
        onChange={vi.fn()}
      />,
      { wrapper: wrapper() }
    );

    await user.click(screen.getByRole('combobox'));
    const options = await screen.findAllByRole('option', { name: /Alpha|Zeta/ });
    expect(options[0].textContent?.startsWith('Alpha')).toBe(true);
    expect(options[1].textContent?.startsWith('Zeta')).toBe(true);
  });

  it('shows a "Recently used" group (not searching) for a previously-selected block, without duplicating it below', async () => {
    recordRecentlyUsedReusableBlock('rb-1');
    vi.mocked(reusableBlocksApi.list).mockResolvedValue({
      data: [
        makeSummary({ id: 'rb-1', name: 'Newsletter CTA' }),
        makeSummary({ id: 'rb-2', name: 'Other block' }),
      ],
      meta: {},
    } as never);

    const user = userEvent.setup();
    render(
      <ReusableBlockRefField
        descriptor={{ key: 'reusableBlockId', label: 'Reusable block', kind: 'reusable-block-ref' }}
        value=""
        onChange={vi.fn()}
      />,
      { wrapper: wrapper() }
    );

    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByText('Recently used')).toBeInTheDocument();
    expect(screen.getAllByRole('option', { name: /Newsletter CTA/ })).toHaveLength(1);
  });

  it('records the selection as recently used on change', async () => {
    vi.mocked(reusableBlocksApi.list).mockResolvedValue({
      data: [makeSummary()],
      meta: {},
    } as never);

    const user = userEvent.setup();
    render(
      <ReusableBlockRefField
        descriptor={{ key: 'reusableBlockId', label: 'Reusable block', kind: 'reusable-block-ref' }}
        value=""
        onChange={vi.fn()}
      />,
      { wrapper: wrapper() }
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: /Newsletter CTA/ }));

    // Re-open to confirm it now appears under "Recently used".
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByText('Recently used')).toBeInTheDocument();
  });

  it('shows a disabled "Favorites" placeholder', async () => {
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

    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByText('Favorites')).toBeInTheDocument();
    const comingSoon = screen.getByText('Coming soon').closest('[role="option"]');
    expect(comingSoon).toHaveAttribute('data-disabled');
  });
});
