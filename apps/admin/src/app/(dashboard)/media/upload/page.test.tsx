import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import MediaUploadPage from './page';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';
import { PERMISSIONS } from '@/constants/permissions';

const replaceMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock, push: vi.fn() }) }));

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

describe('MediaUploadPage', () => {
  it('renders the upload flow for a user with media.upload', () => {
    render(<MediaUploadPage />, { wrapper: wrapper([PERMISSIONS.MEDIA_UPLOAD]) });
    expect(screen.getByRole('heading', { name: 'Upload media' })).toBeInTheDocument();
  });

  it('redirects to /403 for a user without media.upload', () => {
    replaceMock.mockClear();
    render(<MediaUploadPage />, { wrapper: wrapper([]) });
    expect(replaceMock).toHaveBeenCalledWith('/403');
  });
});
