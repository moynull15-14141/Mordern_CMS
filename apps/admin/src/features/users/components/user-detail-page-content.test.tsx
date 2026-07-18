import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { UserDetailPageContent } from './user-detail-page-content';
import { usersApi } from '../services/users.api';
import { sessionsApi } from '../services/sessions.api';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/users.api', () => ({
  usersApi: { get: vi.fn(), remove: vi.fn(), restore: vi.fn(), resetPassword: vi.fn() },
}));
vi.mock('../services/sessions.api', () => ({
  sessionsApi: { list: vi.fn(), terminate: vi.fn(), terminateAll: vi.fn() },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const activeUser = {
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

describe('UserDetailPageContent', () => {
  it('renders the user name, email, and status once loaded', async () => {
    vi.mocked(usersApi.get).mockResolvedValue(activeUser);
    vi.mocked(sessionsApi.list).mockResolvedValue([]);
    render(<UserDetailPageContent userId="u1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0));
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
  });

  it('does not render a Roles or Permissions section', async () => {
    vi.mocked(usersApi.get).mockResolvedValue(activeUser);
    vi.mocked(sessionsApi.list).mockResolvedValue([]);
    render(<UserDetailPageContent userId="u1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0));
    expect(screen.queryByText('Roles')).not.toBeInTheDocument();
    expect(screen.queryByText('Permissions')).not.toBeInTheDocument();
  });

  it('renders a read-only Activity placeholder, never fabricated log entries', async () => {
    vi.mocked(usersApi.get).mockResolvedValue(activeUser);
    vi.mocked(sessionsApi.list).mockResolvedValue([]);
    render(<UserDetailPageContent userId="u1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByText('Activity log not available')).toBeInTheDocument());
  });

  it('shows Edit/Reset password/Delete actions for a non-deleted user', async () => {
    vi.mocked(usersApi.get).mockResolvedValue(activeUser);
    vi.mocked(sessionsApi.list).mockResolvedValue([]);
    render(<UserDetailPageContent userId="u1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Reset password' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('shows only Restore for a soft-deleted user', async () => {
    vi.mocked(usersApi.get).mockResolvedValue({ ...activeUser, deletedAt: '2026-01-03T00:00:00.000Z' });
    vi.mocked(sessionsApi.list).mockResolvedValue([]);
    render(<UserDetailPageContent userId="u1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
  });

  it('navigates to the edit page when Edit is clicked', async () => {
    vi.mocked(usersApi.get).mockResolvedValue(activeUser);
    vi.mocked(sessionsApi.list).mockResolvedValue([]);
    const user = userEvent.setup();
    render(<UserDetailPageContent userId="u1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(pushMock).toHaveBeenCalledWith('/users/u1/edit');
  });

  it('opens the reset-password dialog and submits a new password', async () => {
    vi.mocked(usersApi.get).mockResolvedValue(activeUser);
    vi.mocked(sessionsApi.list).mockResolvedValue([]);
    vi.mocked(usersApi.resetPassword).mockResolvedValue({ message: 'Password reset. All sessions have been logged out.' });
    const user = userEvent.setup();
    render(<UserDetailPageContent userId="u1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Reset password' })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Reset password' }));
    await user.type(screen.getByLabelText('New password'), 'New1!aaaa');
    await user.type(screen.getByLabelText('Confirm new password'), 'New1!aaaa');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    await waitFor(() => expect(usersApi.resetPassword).toHaveBeenCalledWith('u1', { newPassword: 'New1!aaaa' }));
  });

  it('shows a "Terminate all" button when the user has active sessions', async () => {
    vi.mocked(usersApi.get).mockResolvedValue(activeUser);
    vi.mocked(sessionsApi.list).mockResolvedValue([
      {
        id: 's1',
        ipAddress: '1.2.3.4',
        userAgent: null,
        deviceName: 'Chrome',
        browser: null,
        operatingSystem: null,
        country: null,
        city: null,
        rememberMe: false,
        lastSeenAt: '2026-01-01T00:00:00.000Z',
        expiresAt: '2026-01-08T00:00:00.000Z',
        revokedAt: null,
      },
    ]);
    render(<UserDetailPageContent userId="u1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Terminate all' })).toBeInTheDocument());
  });

  it('shows the error state when the user fails to load', async () => {
    vi.mocked(usersApi.get).mockRejectedValue(new Error('not found'));
    vi.mocked(sessionsApi.list).mockResolvedValue([]);
    render(<UserDetailPageContent userId="u1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeInTheDocument());
  });
});
