import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ProtectedRoute } from './protected-route';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';

const replaceMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => new URLSearchParams(),
}));

function wrapper(value: Partial<AuthContextValue>) {
  const authValue: AuthContextValue = {
    user: null,
    roles: [],
    permissions: [],
    isAuthenticated: false,
    isLoading: false,
    login: async () => {},
    logout: async () => {},
    ...value,
  };
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
  };
}

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    render(
      <ProtectedRoute>
        <div>Secret content</div>
      </ProtectedRoute>,
      { wrapper: wrapper({ isAuthenticated: true, isLoading: false }) }
    );
    expect(screen.getByText('Secret content')).toBeInTheDocument();
  });

  it('shows a loader (not children) while the session is loading', () => {
    render(
      <ProtectedRoute>
        <div>Secret content</div>
      </ProtectedRoute>,
      { wrapper: wrapper({ isAuthenticated: false, isLoading: true }) }
    );
    expect(screen.queryByText('Secret content')).not.toBeInTheDocument();
  });

  it('redirects to /login when unauthenticated and not loading', () => {
    replaceMock.mockClear();
    render(
      <ProtectedRoute>
        <div>Secret content</div>
      </ProtectedRoute>,
      { wrapper: wrapper({ isAuthenticated: false, isLoading: false }) }
    );
    expect(replaceMock).toHaveBeenCalledWith(expect.stringContaining('/login'));
    expect(screen.queryByText('Secret content')).not.toBeInTheDocument();
  });
});
