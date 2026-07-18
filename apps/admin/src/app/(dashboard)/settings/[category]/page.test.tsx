import { describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import CategorySettingsPage from './page';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';
import { PERMISSIONS } from '@/constants/permissions';
import { settingsApi } from '@/features/settings/services/settings.api';

const replaceMock = vi.fn();
const notFoundMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
  notFound: () => notFoundMock(),
}));

vi.mock('@/features/settings/services/settings.api', () => ({
  settingsApi: { getByCategory: vi.fn() },
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

describe('CategorySettingsPage', () => {
  it('renders the category form for a user with settings.manage', async () => {
    vi.mocked(settingsApi.getByCategory).mockResolvedValue([]);
    const element = await CategorySettingsPage({ params: Promise.resolve({ category: 'seo' }) });
    render(element, { wrapper: wrapper([PERMISSIONS.SETTINGS_MANAGE]) });

    await waitFor(() => expect(settingsApi.getByCategory).toHaveBeenCalledWith('seo'));
  });

  it('redirects to /403 for a user without settings.manage', async () => {
    replaceMock.mockClear();
    vi.mocked(settingsApi.getByCategory).mockResolvedValue([]);
    const element = await CategorySettingsPage({ params: Promise.resolve({ category: 'seo' }) });
    render(element, { wrapper: wrapper([]) });
    expect(replaceMock).toHaveBeenCalledWith('/403');
  });

  it('calls notFound() for an unrecognized category', async () => {
    notFoundMock.mockClear();
    await CategorySettingsPage({ params: Promise.resolve({ category: 'not-a-real-category' }) });
    expect(notFoundMock).toHaveBeenCalled();
  });
});
