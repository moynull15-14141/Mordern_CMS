import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ThemeDetailPageContent } from './theme-detail-page-content';
import { themesApi } from '../services/themes.api';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/themes.api', () => ({
  themesApi: {
    get: vi.fn(),
    remove: vi.fn(),
    restore: vi.fn(),
    activate: vi.fn(),
    create: vi.fn(),
  },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper(permissions: string[] = ['theme.manage']) {
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

const theme = {
  id: 't1',
  name: 'Classic',
  slug: 'classic',
  version: '1.0.0',
  author: 'Acme',
  description: 'A classic theme.',
  thumbnail: null,
  status: 'DRAFT' as const,
  isActive: false,
  settings: { primaryColor: '#112233' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

describe('ThemeDetailPageContent', () => {
  it('renders theme metadata', async () => {
    vi.mocked(themesApi.get).mockResolvedValue(theme);
    render(<ThemeDetailPageContent themeId="t1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getAllByText('Classic').length).toBeGreaterThan(0));
    expect(screen.getByText('classic')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
  });

  it('renders the appearance preview', async () => {
    vi.mocked(themesApi.get).mockResolvedValue(theme);
    render(<ThemeDetailPageContent themeId="t1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByText('Live Preview')).toBeInTheDocument());
  });

  it('shows an Activate action for a non-active, non-deleted theme and navigates to edit', async () => {
    vi.mocked(themesApi.get).mockResolvedValue(theme);
    const user = userEvent.setup();
    render(<ThemeDetailPageContent themeId="t1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Activate' })).toBeEnabled());

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(pushMock).toHaveBeenCalledWith('/themes/t1/edit');
  });

  it('Duplicate calls themesApi.create composed from the current theme and navigates to the new theme', async () => {
    vi.mocked(themesApi.get).mockResolvedValue(theme);
    vi.mocked(themesApi.create).mockResolvedValue({ ...theme, id: 't2', name: 'Classic (Copy)' });
    const user = userEvent.setup();
    render(<ThemeDetailPageContent themeId="t1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Duplicate' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Duplicate' }));

    await waitFor(() =>
      expect(themesApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Classic (Copy)' })
      )
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/themes/t2'));
  });

  it('Export triggers a JSON download of the theme', async () => {
    vi.mocked(themesApi.get).mockResolvedValue(theme);
    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation((tag: string) => {
        if (tag === 'a') {
          return { click: clickSpy, href: '', download: '' } as unknown as HTMLAnchorElement;
        }
        return originalCreateElement(tag);
      });
    URL.createObjectURL = vi.fn().mockReturnValue('blob:mock');
    URL.revokeObjectURL = vi.fn();

    const user = userEvent.setup();
    render(<ThemeDetailPageContent themeId="t1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Export' }));

    expect(clickSpy).toHaveBeenCalled();
    createElementSpy.mockRestore();
  });

  it('disables the Activate button for the already-active theme', async () => {
    vi.mocked(themesApi.get).mockResolvedValue({ ...theme, isActive: true });
    render(<ThemeDetailPageContent themeId="t1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Active' })).toBeDisabled());
  });

  it('confirms and calls themesApi.remove on Delete', async () => {
    vi.mocked(themesApi.get).mockResolvedValue(theme);
    vi.mocked(themesApi.remove).mockResolvedValue(theme);
    const user = userEvent.setup();
    render(<ThemeDetailPageContent themeId="t1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(await screen.findByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(themesApi.remove).toHaveBeenCalledWith('t1'));
  });

  it('shows Restore instead of Edit/Delete/Activate for a soft-deleted theme', async () => {
    vi.mocked(themesApi.get).mockResolvedValue({ ...theme, deletedAt: '2026-01-05T00:00:00.000Z' });
    render(<ThemeDetailPageContent themeId="t1" />, { wrapper: wrapper() });

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument()
    );
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
  });

  it('activates the theme when confirmed', async () => {
    vi.mocked(themesApi.get).mockResolvedValue(theme);
    vi.mocked(themesApi.activate).mockResolvedValue({ ...theme, isActive: true });
    const user = userEvent.setup();
    render(<ThemeDetailPageContent themeId="t1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Activate' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Activate' }));
    await user.click(await screen.findByRole('button', { name: 'Activate' }));

    await waitFor(() => expect(themesApi.activate).toHaveBeenCalledWith('t1'));
  });
});
