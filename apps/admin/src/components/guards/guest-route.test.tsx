import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { GuestRoute } from './guest-route';
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

describe('GuestRoute', () => {
  it('renders children when not authenticated', () => {
    render(
      <GuestRoute>
        <div>Login form</div>
      </GuestRoute>,
      { wrapper: wrapper({ isAuthenticated: false, isLoading: false }) }
    );
    expect(screen.getByText('Login form')).toBeInTheDocument();
  });

  it('shows a loader (not children) while the session is loading', () => {
    render(
      <GuestRoute>
        <div>Login form</div>
      </GuestRoute>,
      { wrapper: wrapper({ isAuthenticated: false, isLoading: true }) }
    );
    expect(screen.queryByText('Login form')).not.toBeInTheDocument();
  });

  it('redirects away when already authenticated', () => {
    replaceMock.mockClear();
    render(
      <GuestRoute>
        <div>Login form</div>
      </GuestRoute>,
      { wrapper: wrapper({ isAuthenticated: true, isLoading: false }) }
    );
    expect(replaceMock).toHaveBeenCalled();
    expect(screen.queryByText('Login form')).not.toBeInTheDocument();
  });
});
