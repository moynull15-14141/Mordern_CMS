import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { TagsPageContent } from './tags-page-content';
import { tagsApi } from '../services/tags.api';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

const pushMock = vi.fn();
let currentSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => currentSearchParams,
}));

vi.mock('../services/tags.api', () => ({ tagsApi: { list: vi.fn(), remove: vi.fn(), restore: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

function wrapper(permissions: string[] = []) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
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

const oneTag = {
  id: 't1',
  name: 'Breaking',
  slug: 'breaking',
  description: null,
  synonyms: null,
  usageCount: 2,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

beforeEach(() => {
  currentSearchParams = new URLSearchParams();
  vi.clearAllMocks();
});

describe('TagsPageContent', () => {
  it('renders the page title and the tags table', async () => {
    vi.mocked(tagsApi.list).mockResolvedValue({
      data: [oneTag],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    render(<TagsPageContent />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByText('Breaking')).toBeInTheDocument());
  });

  it('shows the "New tag" button only for a user with category.create', async () => {
    vi.mocked(tagsApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    render(<TagsPageContent />, { wrapper: wrapper([]) });
    await waitFor(() => expect(tagsApi.list).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'New tag' })).not.toBeInTheDocument();
  });

  it('navigates to /tags/new when "New tag" is clicked', async () => {
    vi.mocked(tagsApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    const user = userEvent.setup();
    render(<TagsPageContent />, { wrapper: wrapper(['category.create']) });

    await user.click(await screen.findByRole('button', { name: 'New tag' }));
    expect(pushMock).toHaveBeenCalledWith('/tags/new');
  });

  it('opens the delete confirmation and calls tagsApi.remove on confirm', async () => {
    vi.mocked(tagsApi.list).mockResolvedValue({
      data: [oneTag],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    vi.mocked(tagsApi.remove).mockResolvedValue(oneTag);
    const user = userEvent.setup();
    render(<TagsPageContent />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByText('Breaking')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Actions for Breaking' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(tagsApi.remove).toHaveBeenCalledWith('t1'));
  });
});
