import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ProfilePageContent } from './profile-page-content';
import { profileApi } from '../services/profile.api';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';

vi.mock('../services/profile.api', () => ({
  profileApi: { getMe: vi.fn(), removeAvatar: vi.fn() },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const authValue: AuthContextValue = {
    user: { id: 'u1', email: 'jane@example.com', username: null, displayName: 'Jane Doe', status: 'ACTIVE' },
    roles: [],
    permissions: [],
    isAuthenticated: true,
    isLoading: false,
    login: async () => {},
    logout: async () => {},
  };
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
      </QueryClientProvider>
    );
  };
}

const profile = {
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

describe('ProfilePageContent', () => {
  it('renders the profile card once loaded', async () => {
    vi.mocked(profileApi.getMe).mockResolvedValue(profile);
    render(<ProfilePageContent />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0));
  });

  it('renders Edit profile and Change password links', async () => {
    vi.mocked(profileApi.getMe).mockResolvedValue(profile);
    render(<ProfilePageContent />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('link', { name: 'Edit profile' })).toHaveAttribute('href', '/profile/edit'));
    expect(screen.getByRole('link', { name: 'Change password' })).toHaveAttribute('href', '/profile/change-password');
  });

  it('calls profileApi.removeAvatar when Remove avatar is clicked', async () => {
    vi.mocked(profileApi.getMe).mockResolvedValue(profile);
    vi.mocked(profileApi.removeAvatar).mockResolvedValue(profile);
    const user = userEvent.setup();
    render(<ProfilePageContent />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Remove avatar' })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Remove avatar' }));

    await waitFor(() => expect(profileApi.removeAvatar).toHaveBeenCalled());
  });

  it('shows the error state when the profile fails to load', async () => {
    vi.mocked(profileApi.getMe).mockRejectedValue(new Error('boom'));
    render(<ProfilePageContent />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByText('Something went wrong')).toBeInTheDocument());
  });
});
