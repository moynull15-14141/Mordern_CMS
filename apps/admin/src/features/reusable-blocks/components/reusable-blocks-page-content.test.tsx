import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ReusableBlocksPageContent } from './reusable-blocks-page-content';
import { reusableBlocksApi } from '../services/reusable-blocks.api';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

const pushMock = vi.fn();
let currentSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => currentSearchParams,
}));

vi.mock('../services/reusable-blocks.api', () => ({
  reusableBlocksApi: {
    list: vi.fn(),
    remove: vi.fn(),
    restore: vi.fn(),
    duplicate: vi.fn(),
    getUsages: vi.fn(),
  },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

function wrapper(permissions: string[] = []) {
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

const oneBlock = {
  id: 'rb-1',
  name: 'Newsletter callout',
  description: null,
  category: null,
  blockType: 'callout',
  data: { text: 'Subscribe' },
  children: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

beforeEach(() => {
  currentSearchParams = new URLSearchParams();
  vi.clearAllMocks();
});

describe('ReusableBlocksPageContent', () => {
  it('renders the page title and the table', async () => {
    vi.mocked(reusableBlocksApi.list).mockResolvedValue({
      data: [oneBlock],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    render(<ReusableBlocksPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('Newsletter callout')).toBeInTheDocument());
  });

  it('shows the "New reusable block" button only for a user with page.manage', async () => {
    vi.mocked(reusableBlocksApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    render(<ReusableBlocksPageContent />, { wrapper: wrapper([]) });
    await waitFor(() => expect(reusableBlocksApi.list).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'New reusable block' })).not.toBeInTheDocument();
  });

  it('navigates to /reusable-blocks/new when "New reusable block" is clicked', async () => {
    vi.mocked(reusableBlocksApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    const user = userEvent.setup();
    render(<ReusableBlocksPageContent />, { wrapper: wrapper(['page.manage']) });

    await user.click(await screen.findByRole('button', { name: 'New reusable block' }));
    expect(pushMock).toHaveBeenCalledWith('/reusable-blocks/new');
  });

  it('passes page/search/blockType params from the URL into reusableBlocksApi.list', async () => {
    currentSearchParams = new URLSearchParams({ page: '2', search: 'foo', blockType: 'callout' });
    vi.mocked(reusableBlocksApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 2, limit: 20, total: 0, hasNext: false, hasPrevious: true } },
    });
    render(<ReusableBlocksPageContent />, { wrapper: wrapper([]) });

    await waitFor(() =>
      expect(reusableBlocksApi.list).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, search: 'foo', blockType: 'callout' })
      )
    );
  });

  it('opens the delete confirmation (no usages) and calls reusableBlocksApi.remove on confirm', async () => {
    vi.mocked(reusableBlocksApi.list).mockResolvedValue({
      data: [oneBlock],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    vi.mocked(reusableBlocksApi.getUsages).mockResolvedValue([]);
    vi.mocked(reusableBlocksApi.remove).mockResolvedValue(oneBlock);
    const user = userEvent.setup();
    render(<ReusableBlocksPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('Newsletter callout')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Actions for Newsletter callout' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(
      await screen.findByText('Delete "Newsletter callout"?', { exact: false })
    ).toBeInTheDocument();

    await user.click(await screen.findByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(reusableBlocksApi.remove).toHaveBeenCalledWith('rb-1'));
  });

  it('opens the delete confirmation and blocks deletion when the block is still referenced', async () => {
    vi.mocked(reusableBlocksApi.list).mockResolvedValue({
      data: [oneBlock],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    vi.mocked(reusableBlocksApi.getUsages).mockResolvedValue([
      { contentType: 'page', id: 'p1', title: 'About', slug: 'about' },
    ]);
    const user = userEvent.setup();
    render(<ReusableBlocksPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('Newsletter callout')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Actions for Newsletter callout' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(await screen.findByText(/still used in 1 place/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    expect(reusableBlocksApi.remove).not.toHaveBeenCalled();
  });

  it('opens the duplicate dialog and calls reusableBlocksApi.duplicate on submit', async () => {
    vi.mocked(reusableBlocksApi.list).mockResolvedValue({
      data: [oneBlock],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    vi.mocked(reusableBlocksApi.duplicate).mockResolvedValue({ ...oneBlock, id: 'rb-2' });
    const user = userEvent.setup();
    render(<ReusableBlocksPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('Newsletter callout')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Actions for Newsletter callout' }));
    await user.click(screen.getByRole('menuitem', { name: 'Duplicate' }));

    const nameField = await screen.findByLabelText('Name');
    expect(nameField).toHaveValue('Newsletter callout (copy)');
    await user.click(screen.getByRole('button', { name: 'Duplicate' }));

    await waitFor(() =>
      expect(reusableBlocksApi.duplicate).toHaveBeenCalledWith(
        oneBlock,
        'Newsletter callout (copy)'
      )
    );
  });
});
