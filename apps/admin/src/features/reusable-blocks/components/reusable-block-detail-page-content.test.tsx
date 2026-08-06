import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ReusableBlockDetailPageContent } from './reusable-block-detail-page-content';
import { reusableBlocksApi } from '../services/reusable-blocks.api';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/reusable-blocks.api', () => ({
  reusableBlocksApi: {
    get: vi.fn(),
    remove: vi.fn(),
    restore: vi.fn(),
    duplicate: vi.fn(),
    getUsages: vi.fn(),
  },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper(permissions: string[] = ['page.manage']) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const permissionValue: PermissionContextValue = {
    permissions,
    roles: [],
    can: (p) => permissions.includes(p),
    canAny: (required) => required.some((p) => permissions.includes(p)),
    canAll: (required) => required.every((p) => permissions.includes(p)),
    isRole: () => false,
  };
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <PermissionContext.Provider value={permissionValue}>{children}</PermissionContext.Provider>
      </QueryClientProvider>
    );
  };
}

const block = {
  id: 'rb-1',
  name: 'Newsletter callout',
  description: 'A callout for the newsletter.',
  category: 'Marketing',
  blockType: 'callout',
  data: { title: '', text: 'Subscribe today', tone: 'info' },
  children: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

describe('ReusableBlockDetailPageContent', () => {
  it('renders name, type, category, description, and a preview', async () => {
    vi.mocked(reusableBlocksApi.get).mockResolvedValue(block);
    vi.mocked(reusableBlocksApi.getUsages).mockResolvedValue([]);
    render(<ReusableBlockDetailPageContent blockId="rb-1" />, { wrapper: wrapper() });

    await waitFor(() =>
      expect(screen.getAllByText('Newsletter callout').length).toBeGreaterThan(0)
    );
    expect(screen.getByText('Callout')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('A callout for the newsletter.')).toBeInTheDocument();
    expect(screen.getByText('Subscribe today')).toBeInTheDocument();
  });

  it('shows "Not used anywhere yet" when there are no usages', async () => {
    vi.mocked(reusableBlocksApi.get).mockResolvedValue(block);
    vi.mocked(reusableBlocksApi.getUsages).mockResolvedValue([]);
    render(<ReusableBlockDetailPageContent blockId="rb-1" />, { wrapper: wrapper() });

    expect(await screen.findByText('Not used anywhere yet.')).toBeInTheDocument();
  });

  it('shows Used By links when the block is referenced', async () => {
    vi.mocked(reusableBlocksApi.get).mockResolvedValue(block);
    vi.mocked(reusableBlocksApi.getUsages).mockResolvedValue([
      { contentType: 'page', id: 'p1', title: 'About', slug: 'about' },
    ]);
    render(<ReusableBlockDetailPageContent blockId="rb-1" />, { wrapper: wrapper() });

    expect(await screen.findByRole('link', { name: /About/ })).toBeInTheDocument();
  });

  it('navigates to edit when Edit is clicked', async () => {
    vi.mocked(reusableBlocksApi.get).mockResolvedValue(block);
    vi.mocked(reusableBlocksApi.getUsages).mockResolvedValue([]);
    const user = userEvent.setup();
    render(<ReusableBlockDetailPageContent blockId="rb-1" />, { wrapper: wrapper() });

    await user.click(await screen.findByRole('button', { name: 'Edit' }));
    expect(pushMock).toHaveBeenCalledWith('/reusable-blocks/rb-1/edit');
  });

  it('shows Restore instead of Edit/Duplicate/Delete for a soft-deleted block', async () => {
    vi.mocked(reusableBlocksApi.get).mockResolvedValue({
      ...block,
      deletedAt: '2026-01-05T00:00:00.000Z',
    });
    vi.mocked(reusableBlocksApi.getUsages).mockResolvedValue([]);
    render(<ReusableBlockDetailPageContent blockId="rb-1" />, { wrapper: wrapper() });

    expect(await screen.findByRole('button', { name: 'Restore' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
  });

  it('confirms and calls reusableBlocksApi.remove on Delete when there are no usages', async () => {
    vi.mocked(reusableBlocksApi.get).mockResolvedValue(block);
    vi.mocked(reusableBlocksApi.getUsages).mockResolvedValue([]);
    vi.mocked(reusableBlocksApi.remove).mockResolvedValue(block);
    const user = userEvent.setup();
    render(<ReusableBlockDetailPageContent blockId="rb-1" />, { wrapper: wrapper() });

    await user.click(await screen.findByRole('button', { name: 'Delete' }));
    await user.click(await screen.findByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(reusableBlocksApi.remove).toHaveBeenCalledWith('rb-1'));
  });
});
