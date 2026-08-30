import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { NavigationPageContent } from './navigation-page-content';
import { menusApi } from '../services/menus.api';
import { useActiveTheme } from '@/features/themes';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

const pushMock = vi.fn();
let currentSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => currentSearchParams,
}));

vi.mock('../services/menus.api', () => ({
  menusApi: { list: vi.fn(), remove: vi.fn(), restore: vi.fn() },
}));
vi.mock('@/features/themes', () => ({ useActiveTheme: vi.fn() }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

function wrapper(permissions: string[] = []) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
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
        <PermissionContext.Provider value={permissionValue}>{children}</PermissionContext.Provider>
      </QueryClientProvider>
    );
  };
}

const mainNav = {
  id: 'm1',
  siteId: 's1',
  name: 'Main Navigation',
  slug: 'main-navigation',
  location: 'header',
  status: 'PUBLISHED' as const,
  items: [
    {
      id: 'i1',
      menuId: 'm1',
      parentId: null,
      label: 'Home',
      targetType: 'CUSTOM_URL' as const,
      pageId: null,
      articleId: null,
      categoryId: null,
      url: '/',
      openMode: 'SELF' as const,
      icon: null,
      cssClass: null,
      sortOrder: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      deletedAt: null,
      children: [],
    },
  ],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

beforeEach(() => {
  currentSearchParams = new URLSearchParams();
  vi.clearAllMocks();
  vi.mocked(useActiveTheme).mockReturnValue({ data: undefined } as never);
});

describe('NavigationPageContent', () => {
  it('renders the page title and the menu name — never a raw id', async () => {
    vi.mocked(menusApi.list).mockResolvedValue({
      data: [mainNav],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    render(<NavigationPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('Main Navigation')).toBeInTheDocument());
    expect(screen.queryByText('m1')).not.toBeInTheDocument();
  });

  it('shows the empty state copy when there are no menus yet', async () => {
    vi.mocked(menusApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    render(<NavigationPageContent />, { wrapper: wrapper([]) });
    expect(await screen.findByText('No navigation menus yet')).toBeInTheDocument();
  });

  it('shows the "New navigation" button only for a user with menu.manage', async () => {
    vi.mocked(menusApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    render(<NavigationPageContent />, { wrapper: wrapper([]) });
    await waitFor(() => expect(menusApi.list).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'New navigation' })).not.toBeInTheDocument();
  });

  it('navigates to /navigation/new when "New navigation" is clicked', async () => {
    vi.mocked(menusApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 20, total: 0, hasNext: false, hasPrevious: false } },
    });
    const user = userEvent.setup();
    render(<NavigationPageContent />, { wrapper: wrapper(['menu.manage']) });

    await user.click(await screen.findByRole('button', { name: 'New navigation' }));
    expect(pushMock).toHaveBeenCalledWith('/navigation/new');
  });

  it('opens the delete confirmation and calls menusApi.remove on confirm', async () => {
    vi.mocked(menusApi.list).mockResolvedValue({
      data: [mainNav],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    vi.mocked(menusApi.remove).mockResolvedValue(mainNav);
    const user = userEvent.setup();
    render(<NavigationPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('Main Navigation')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Actions for Main Navigation' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(await screen.findByRole('button', { name: 'Delete' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(menusApi.remove).toHaveBeenCalledWith('m1'));
  });

  it('warns before deleting a menu currently assigned to the Header', async () => {
    vi.mocked(menusApi.list).mockResolvedValue({
      data: [mainNav],
      meta: { pagination: { page: 1, limit: 20, total: 1, hasNext: false, hasPrevious: false } },
    });
    vi.mocked(useActiveTheme).mockReturnValue({
      data: { settings: { designTokens: { header: { menuId: 'm1' } } } },
    } as never);
    const user = userEvent.setup();
    render(<NavigationPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByText('Main Navigation')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Actions for Main Navigation' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(await screen.findByText(/currently used by your Header/i)).toBeInTheDocument();
  });
});
