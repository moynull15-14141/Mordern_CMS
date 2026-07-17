import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useAuth } from './use-auth';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';

const mockValue: AuthContextValue = {
  user: { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B' } as never,
  roles: ['Administrator'],
  permissions: ['users.manage'],
  isAuthenticated: true,
  isLoading: false,
  login: async () => {},
  logout: async () => {},
};

function wrapper({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={mockValue}>{children}</AuthContext.Provider>;
}

describe('useAuth', () => {
  it('returns the AuthContext value when used within an AuthProvider', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.roles).toEqual(['Administrator']);
  });

  it('throws when used outside an AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth() must be used within an <AuthProvider>.'
    );
  });
});
