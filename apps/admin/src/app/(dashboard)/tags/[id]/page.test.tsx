import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import TagDetailPage from './page';
import { AuthContext, type AuthContextValue } from '@/providers/auth-provider';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';
import { PERMISSIONS } from '@/constants/permissions';
import { tagsApi } from '@/features/tags/services/tags.api';

const replaceMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock, push: vi.fn() }) }));
vi.mock('@/features/tags/services/tags.api', () => ({ tagsApi: { get: vi.fn() } }));

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

const tag = {
  id: 't1',
  name: 'Breaking',
  slug: 'breaking',
  description: null,
  synonyms: null,
  usageCount: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
};

describe('TagDetailPage', () => {
  it('renders tag details for a user with category.create', async () => {
    vi.mocked(tagsApi.get).mockResolvedValue(tag);

    const element = await TagDetailPage({ params: Promise.resolve({ id: 't1' }) });
    render(element, { wrapper: wrapper([PERMISSIONS.CATEGORY_CREATE]) });

    await waitFor(() => expect(screen.getAllByText('Breaking').length).toBeGreaterThan(0));
  });

  it('redirects to /403 for a user without category.create', async () => {
    replaceMock.mockClear();
    const element = await TagDetailPage({ params: Promise.resolve({ id: 't1' }) });
    render(element, { wrapper: wrapper([]) });
    expect(replaceMock).toHaveBeenCalledWith('/403');
  });
});
