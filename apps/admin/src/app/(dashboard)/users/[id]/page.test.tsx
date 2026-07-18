import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import UserDetailPage from './page';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';
import { PERMISSIONS } from '@/constants/permissions';
import { usersApi } from '@/features/users/services/users.api';
import { sessionsApi } from '@/features/users/services/sessions.api';

const replaceMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock, push: vi.fn() }) }));
vi.mock('@/features/users/services/users.api', () => ({
  usersApi: { get: vi.fn(), remove: vi.fn(), restore: vi.fn(), resetPassword: vi.fn() },
}));
vi.mock('@/features/users/services/sessions.api', () => ({
  sessionsApi: { list: vi.fn(), terminate: vi.fn(), terminateAll: vi.fn() },
}));

function wrapper(permissions: string[]) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
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
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={authValue}>
          <PermissionContext.Provider value={permissionValue}>{children}</PermissionContext.Provider>
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };
}

describe('UserDetailPage', () => {
  it('renders the user detail content for a user with users.manage', async () => {
    vi.mocked(usersApi.get).mockResolvedValue({
      id: 'u1',
      email: 'jane@example.com',
      username: 'jdoe',
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
    vi.mocked(sessionsApi.list).mockResolvedValue([]);

    const element = await UserDetailPage({ params: Promise.resolve({ id: 'u1' }) });
    render(element, { wrapper: wrapper([PERMISSIONS.USERS_MANAGE]) });

    await waitFor(() => expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0));
    expect(usersApi.get).toHaveBeenCalledWith('u1');
  });

  it('redirects to /403 for a user without users.manage', async () => {
    replaceMock.mockClear();
    const element = await UserDetailPage({ params: Promise.resolve({ id: 'u1' }) });
    render(element, { wrapper: wrapper([]) });
    expect(replaceMock).toHaveBeenCalledWith('/403');
  });
});
