import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { SettingsPageContent } from './settings-page-content';
import { settingsApi } from '../services/settings.api';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';
import type { Setting } from '../types/settings';

const pushMock = vi.fn();
let currentSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => currentSearchParams,
}));

vi.mock('../services/settings.api', () => ({
  settingsApi: { getAll: vi.fn(), resetAll: vi.fn() },
}));

vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

function wrapper(permissions: string[] = []) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
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

const twoSettings: Setting[] = [
  {
    key: 'general.siteName',
    category: 'general',
    type: 'STRING',
    label: 'Site Name',
    value: 'Modern CMS',
    source: 'DEFAULT',
    isReadOnly: false,
    isHidden: false,
    isEncrypted: false,
  },
  {
    key: 'seo.metaTitle',
    category: 'seo',
    type: 'STRING',
    label: 'Meta Title',
    value: 'Home',
    source: 'DEFAULT',
    isReadOnly: false,
    isHidden: false,
    isEncrypted: false,
  },
];

beforeEach(() => {
  currentSearchParams = new URLSearchParams();
  vi.clearAllMocks();
});

describe('SettingsPageContent', () => {
  it('renders the page title and every fetched setting', async () => {
    vi.mocked(settingsApi.getAll).mockResolvedValue(twoSettings);
    render(<SettingsPageContent />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByText('Site Name')).toBeInTheDocument());
    expect(screen.getByText('Meta Title')).toBeInTheDocument();
  });

  it('filters client-side by the ?category= URL param', async () => {
    currentSearchParams = new URLSearchParams({ category: 'seo' });
    vi.mocked(settingsApi.getAll).mockResolvedValue(twoSettings);
    render(<SettingsPageContent />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByText('Meta Title')).toBeInTheDocument());
    expect(screen.queryByText('Site Name')).not.toBeInTheDocument();
  });

  it('filters client-side by the ?search= URL param (key or label)', async () => {
    currentSearchParams = new URLSearchParams({ search: 'siteName' });
    vi.mocked(settingsApi.getAll).mockResolvedValue(twoSettings);
    render(<SettingsPageContent />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByText('Site Name')).toBeInTheDocument());
    expect(screen.queryByText('Meta Title')).not.toBeInTheDocument();
  });

  it('shows the "Reset all settings" action only for a user with settings.manage', async () => {
    vi.mocked(settingsApi.getAll).mockResolvedValue(twoSettings);
    render(<SettingsPageContent />, { wrapper: wrapper([]) });

    await waitFor(() => expect(settingsApi.getAll).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'Reset all settings' })).not.toBeInTheDocument();
  });

  it('opens the Setting Details dialog when "View details" is selected', async () => {
    vi.mocked(settingsApi.getAll).mockResolvedValue(twoSettings);
    const user = userEvent.setup();
    render(<SettingsPageContent />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByText('Site Name')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Actions for Site Name' }));
    await user.click(screen.getByRole('menuitem', { name: 'View details' }));

    expect(within(screen.getByRole('dialog')).getByText('general.siteName')).toBeInTheDocument();
  });

  it('navigates to the category page when Edit is selected', async () => {
    vi.mocked(settingsApi.getAll).mockResolvedValue(twoSettings);
    const user = userEvent.setup();
    render(<SettingsPageContent />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByText('Site Name')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Actions for Site Name' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

    expect(pushMock).toHaveBeenCalledWith('/settings/general');
  });

  it('opens the reset-all confirmation and calls settingsApi.resetAll on confirm', async () => {
    vi.mocked(settingsApi.getAll).mockResolvedValue(twoSettings);
    vi.mocked(settingsApi.resetAll).mockResolvedValue({ resetCount: 34 });
    const user = userEvent.setup();
    render(<SettingsPageContent />, { wrapper: wrapper(['settings.manage']) });

    await waitFor(() => expect(screen.getByText('Site Name')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Reset all settings' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/Reset every setting across every category/)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Reset all settings' }));
    await waitFor(() => expect(settingsApi.resetAll).toHaveBeenCalledWith());
  });
});
