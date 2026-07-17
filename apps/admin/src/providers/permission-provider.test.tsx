import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { PermissionProvider } from './permission-provider';
import { usePermissions } from '@/hooks/use-permissions';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';
import { PERMISSIONS } from '@/constants/permissions';

function makeAuthWrapper(permissions: string[], roles: string[]) {
  const authValue: AuthContextValue = {
    user: null,
    roles,
    permissions,
    isAuthenticated: true,
    isLoading: false,
    login: async () => {},
    logout: async () => {},
  };
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AuthContext.Provider value={authValue}>
        <PermissionProvider>{children}</PermissionProvider>
      </AuthContext.Provider>
    );
  };
}

describe('PermissionProvider', () => {
  it('exposes the permissions and roles it read from AuthContext', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: makeAuthWrapper([PERMISSIONS.ARTICLE_CREATE], ['Editor']),
    });
    expect(result.current.permissions).toEqual([PERMISSIONS.ARTICLE_CREATE]);
    expect(result.current.roles).toEqual(['Editor']);
  });

  it('can() reflects a granted permission', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: makeAuthWrapper([PERMISSIONS.ARTICLE_CREATE], []),
    });
    expect(result.current.can(PERMISSIONS.ARTICLE_CREATE)).toBe(true);
    expect(result.current.can(PERMISSIONS.ARTICLE_DELETE)).toBe(false);
  });

  it('canAny() uses OR semantics', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: makeAuthWrapper([PERMISSIONS.ARTICLE_CREATE], []),
    });
    expect(result.current.canAny([PERMISSIONS.ARTICLE_DELETE, PERMISSIONS.ARTICLE_CREATE])).toBe(
      true
    );
  });

  it('canAll() uses AND semantics', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: makeAuthWrapper([PERMISSIONS.ARTICLE_CREATE], []),
    });
    expect(result.current.canAll([PERMISSIONS.ARTICLE_DELETE, PERMISSIONS.ARTICLE_CREATE])).toBe(
      false
    );
  });

  it('isRole() reflects the roles from AuthContext', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: makeAuthWrapper([], ['Administrator']),
    });
    expect(result.current.isRole('Administrator')).toBe(true);
    expect(result.current.isRole('Editor')).toBe(false);
  });
});
