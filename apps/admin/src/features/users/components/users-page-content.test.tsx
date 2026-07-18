import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { UsersPageContent } from './users-page-content';
import { usersApi } from '../services/users.api';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

const pushMock = vi.fn();
let currentSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => currentSearchParams,
}));

vi.mock('../services/users.api', () => ({
  usersApi: { list: vi.fn(), remove: vi.fn(), restore: vi.fn() },
}));

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

const oneUser = {
  id: 'u1',
  email: 'jane@example.com',
  username: 'jdoe',
  displayName: 'Jane Doe',
  status: 'ACTIVE' as const,
  profileImageId: null,
  lastLoginAt: null,
  locked: false,
  profile: null,
  preferences: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

beforeEach(() => {
  currentSearchParams = new URLSearchParams();
  vi.clearAllMocks();
});

describe('UsersPageContent', () => {
  it('renders the page title and the users table', async () => {
    vi.mocked(usersApi.list).mockResolvedValue({
      data: [oneUser],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    render(<UsersPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('Jane Doe')).toBeInTheDocument());
  });

  it('shows the "New user" button only for a user with users.manage', async () => {
    vi.mocked(usersApi.list).mockResolvedValue({ data: [], meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } } });
    const { rerender } = render(<UsersPageContent />, { wrapper: wrapper([]) });
    await waitFor(() => expect(usersApi.list).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'New user' })).not.toBeInTheDocument();

    rerender(<UsersPageContent />);
  });

  it('navigates to /users/new when "New user" is clicked (users.manage granted)', async () => {
    vi.mocked(usersApi.list).mockResolvedValue({ data: [], meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } } });
    const user = userEvent.setup();
    render(<UsersPageContent />, { wrapper: wrapper(['users.manage']) });

    await user.click(await screen.findByRole('button', { name: 'New user' }));
    expect(pushMock).toHaveBeenCalledWith('/users/new');
  });

  it('passes the page/search/status params from the URL into usersApi.list', async () => {
    currentSearchParams = new URLSearchParams({ page: '2', search: 'jane', status: 'ACTIVE' });
    vi.mocked(usersApi.list).mockResolvedValue({ data: [], meta: { pagination: { page: 2, limit: 20, total: 0, hasNext: false, hasPrevious: true } } });
    render(<UsersPageContent />, { wrapper: wrapper([]) });

    await waitFor(() =>
      expect(usersApi.list).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, search: 'jane', status: 'ACTIVE' }),
      ),
    );
  });

  it('opens the delete confirmation dialog and calls usersApi.remove on confirm', async () => {
    vi.mocked(usersApi.list).mockResolvedValue({
      data: [oneUser],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    vi.mocked(usersApi.remove).mockResolvedValue(oneUser);
    const user = userEvent.setup();
    render(<UsersPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('Jane Doe')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Actions for Jane Doe' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    // DeleteDialog's description is one full sentence ("Delete "Jane Doe"?
    // This can be undone...") as a single text node — match the substring
    // with { exact: false } rather than expecting an exact-match node that
    // doesn't exist.
    expect(await screen.findByText('Delete "Jane Doe"?', { exact: false })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(usersApi.remove).toHaveBeenCalledWith('u1'));
  });

  it('navigates to /users/:id/edit when Edit is clicked', async () => {
    vi.mocked(usersApi.list).mockResolvedValue({
      data: [oneUser],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    const user = userEvent.setup();
    render(<UsersPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('Jane Doe')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Actions for Jane Doe' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(pushMock).toHaveBeenCalledWith('/users/u1/edit');
  });
});
