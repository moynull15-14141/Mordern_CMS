import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import MediaPage from './page';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';
import { PERMISSIONS } from '@/constants/permissions';
import { mediaApi } from '@/features/media/services/media.api';
import { mediaFoldersApi } from '@/features/media/services/media-folders.api';

const replaceMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('@/features/media/services/media.api', () => ({ mediaApi: { list: vi.fn() } }));
vi.mock('@/features/media/services/media-folders.api', () => ({ mediaFoldersApi: { getTree: vi.fn() } }));

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

describe('MediaPage', () => {
  it('renders the Media Library for a user holding any relevant permission', () => {
    vi.mocked(mediaApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 24, total: 0, hasNext: false, hasPrevious: false } },
    });
    vi.mocked(mediaFoldersApi.getTree).mockResolvedValue([]);
    render(<MediaPage />, { wrapper: wrapper([PERMISSIONS.MEDIA_UPLOAD]) });
    expect(screen.getByRole('heading', { name: 'Media Library' })).toBeInTheDocument();
  });

  it('redirects to /403 for a user with neither media permission', () => {
    replaceMock.mockClear();
    render(<MediaPage />, { wrapper: wrapper([]) });
    expect(replaceMock).toHaveBeenCalledWith('/403');
  });
});
