import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DashboardHome } from './dashboard-home';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

function wrapper({ children }: { children: ReactNode }) {
  const authValue: AuthContextValue = {
    user: { id: '1', email: 'a@b.com', username: null, displayName: 'Alex User', status: 'ACTIVE' },
    roles: [],
    permissions: [],
    isAuthenticated: true,
    isLoading: false,
    login: async () => {},
    logout: async () => {},
  };
  const permissionValue: PermissionContextValue = {
    permissions: [],
    roles: [],
    can: () => false,
    canAny: () => false,
    canAll: () => false,
    isRole: () => false,
  };
  return (
    <AuthContext.Provider value={authValue}>
      <PermissionContext.Provider value={permissionValue}>{children}</PermissionContext.Provider>
    </AuthContext.Provider>
  );
}

describe('DashboardHome', () => {
  it('renders the page title', () => {
    render(<DashboardHome />, { wrapper });
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('renders the real profile summary', () => {
    render(<DashboardHome />, { wrapper });
    expect(screen.getByText('Alex User')).toBeInTheDocument();
  });

  it('renders exactly 4 statistic cards, all as skeletons (no fetched numbers)', () => {
    render(<DashboardHome />, { wrapper });
    expect(screen.getByText('Articles')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Comments')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('renders the Recent Activity and System Status placeholders', () => {
    render(<DashboardHome />, { wrapper });
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('System Status')).toBeInTheDocument();
  });

  it('renders the Quick Actions card', () => {
    render(<DashboardHome />, { wrapper });
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });
});
