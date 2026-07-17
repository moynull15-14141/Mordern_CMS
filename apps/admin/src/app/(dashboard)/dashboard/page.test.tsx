import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import DashboardPage from './page';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';
import { PERMISSIONS } from '@/constants/permissions';

const replaceMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

function wrapper(permissions: string[]) {
  const authValue: AuthContextValue = {
    user: { id: '1', email: 'a@b.com', username: null, displayName: null, status: 'ACTIVE' },
    roles: [],
    permissions,
    isAuthenticated: true,
    isLoading: false,
    login: async () => {},
    logout: async () => {},
  };
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
      <AuthContext.Provider value={authValue}>
        <PermissionContext.Provider value={permissionValue}>{children}</PermissionContext.Provider>
      </AuthContext.Provider>
    );
  };
}

describe('DashboardPage', () => {
  it('renders the dashboard for a user with dashboard.view', () => {
    render(<DashboardPage />, { wrapper: wrapper([PERMISSIONS.DASHBOARD_VIEW]) });
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('redirects to /403 for a user without dashboard.view', () => {
    replaceMock.mockClear();
    render(<DashboardPage />, { wrapper: wrapper([]) });
    expect(replaceMock).toHaveBeenCalledWith('/403');
  });
});
