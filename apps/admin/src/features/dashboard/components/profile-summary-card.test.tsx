import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ProfileSummaryCard } from './profile-summary-card';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';

function wrapper(value: Partial<AuthContextValue>) {
  const authValue: AuthContextValue = {
    user: null,
    roles: [],
    permissions: [],
    isAuthenticated: true,
    isLoading: false,
    login: async () => {},
    logout: async () => {},
    ...value,
  };
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
  };
}

describe('ProfileSummaryCard', () => {
  it("renders the user's real display name and email from the session", () => {
    render(<ProfileSummaryCard />, {
      wrapper: wrapper({
        user: {
          id: '1',
          email: 'a@b.com',
          username: 'auser',
          displayName: 'Alex User',
          status: 'ACTIVE',
        },
      }),
    });
    expect(screen.getByText('Alex User')).toBeInTheDocument();
    expect(screen.getByText('a@b.com')).toBeInTheDocument();
  });

  it('falls back to username when displayName is null', () => {
    render(<ProfileSummaryCard />, {
      wrapper: wrapper({
        user: { id: '1', email: 'a@b.com', username: 'auser', displayName: null, status: 'ACTIVE' },
      }),
    });
    expect(screen.getByText('auser')).toBeInTheDocument();
  });

  it('falls back to a generic greeting when no user data is available yet', () => {
    render(<ProfileSummaryCard />, { wrapper: wrapper({ user: null }) });
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
  });
});
