import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import ProfilePage from './page';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';
import { profileApi } from '@/features/profile/services/profile.api';

vi.mock('@/features/profile/services/profile.api', () => ({
  profileApi: { getMe: vi.fn(), removeAvatar: vi.fn() },
}));

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const authValue: AuthContextValue = {
    user: { id: '1', email: 'a@b.com', username: null, displayName: 'Jane Doe', status: 'ACTIVE' },
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

describe('ProfilePage', () => {
  it('renders without any permission requirement (self-service)', async () => {
    vi.mocked(profileApi.getMe).mockResolvedValue({
      id: '1',
      email: 'a@b.com',
      username: null,
      displayName: 'Jane Doe',
      status: 'ACTIVE',
      profileImageId: null,
      lastLoginAt: null,
      locked: false,
      profile: null,
      preferences: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      deletedAt: null,
    });
    render(<ProfilePage />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0));
  });
});
