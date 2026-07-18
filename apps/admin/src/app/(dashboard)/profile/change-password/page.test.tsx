import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import ChangePasswordPage from './page';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';

vi.mock('@/features/profile/services/profile.api', () => ({
  profileApi: { changePassword: vi.fn() },
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

describe('ChangePasswordPage', () => {
  it('renders without any permission requirement (self-service)', () => {
    render(<ChangePasswordPage />, { wrapper: wrapper() });
    expect(screen.getByRole('heading', { name: 'Change password' })).toBeInTheDocument();
  });
});
