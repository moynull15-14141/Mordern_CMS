import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import MediaDetailPage from './page';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';
import { PERMISSIONS } from '@/constants/permissions';
import { mediaApi } from '@/features/media/services/media.api';

const replaceMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock, push: vi.fn() }) }));
vi.mock('@/features/media/services/media.api', () => ({
  mediaApi: { get: vi.fn(), getUsages: vi.fn(), getDuplicates: vi.fn() },
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

const media = {
  id: 'm1',
  type: 'IMAGE' as const,
  status: 'READY' as const,
  storageKey: 'uploads/photo.jpg',
  filename: 'photo.jpg',
  folderId: null,
  mimeType: 'image/jpeg',
  filesize: '2048',
  width: 800,
  height: 600,
  duration: null,
  altText: null,
  caption: null,
  credit: null,
  uploadedBy: 'u1',
  usageCount: 0,
  usages: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

describe('MediaDetailPage', () => {
  it('renders media details for a user holding any relevant permission', async () => {
    vi.mocked(mediaApi.get).mockResolvedValue(media);
    vi.mocked(mediaApi.getUsages).mockResolvedValue([]);
    vi.mocked(mediaApi.getDuplicates).mockResolvedValue([]);

    const element = await MediaDetailPage({ params: Promise.resolve({ id: 'm1' }) });
    render(element, { wrapper: wrapper([PERMISSIONS.MEDIA_UPLOAD]) });

    await waitFor(() => expect(screen.getAllByText('photo.jpg').length).toBeGreaterThan(0));
  });

  it('redirects to /403 for a user with neither media permission', async () => {
    replaceMock.mockClear();
    const element = await MediaDetailPage({ params: Promise.resolve({ id: 'm1' }) });
    render(element, { wrapper: wrapper([]) });
    expect(replaceMock).toHaveBeenCalledWith('/403');
  });
});
