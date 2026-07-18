import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { CategorySettingsPageContent } from './category-settings-page-content';
import { settingsApi } from '../services/settings.api';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/settings.api', () => ({
  settingsApi: { getByCategory: vi.fn(), bulkUpdateCategory: vi.fn(), resetCategory: vi.fn() },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper(permissions: string[] = ['settings.manage']) {
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

const seoSettings = [
  {
    key: 'seo.metaTitle',
    category: 'seo',
    type: 'STRING',
    label: 'Meta Title',
    value: 'Modern CMS',
    source: 'DEFAULT',
    isReadOnly: false,
    isHidden: false,
    isEncrypted: false,
  },
];

describe('CategorySettingsPageContent', () => {
  it('loads settings for the category and pre-fills the form', async () => {
    vi.mocked(settingsApi.getByCategory).mockResolvedValue(seoSettings as never);
    render(<CategorySettingsPageContent category="seo" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText(/Meta Title/)).toHaveValue('Modern CMS'));
    expect(settingsApi.getByCategory).toHaveBeenCalledWith('seo');
  });

  it('navigates back to Settings without a confirm dialog when the form is clean', async () => {
    vi.mocked(settingsApi.getByCategory).mockResolvedValue(seoSettings as never);
    const user = userEvent.setup();
    render(<CategorySettingsPageContent category="seo" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText(/Meta Title/)).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Back to Settings' }));

    expect(pushMock).toHaveBeenCalledWith('/settings');
    expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument();
  });

  it('shows a discard-changes confirmation when navigating back with unsaved edits', async () => {
    vi.mocked(settingsApi.getByCategory).mockResolvedValue(seoSettings as never);
    const user = userEvent.setup();
    render(<CategorySettingsPageContent category="seo" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText(/Meta Title/)).toBeInTheDocument());
    await user.type(screen.getByLabelText(/Meta Title/), '!');
    await user.click(screen.getByRole('button', { name: 'Back to Settings' }));

    expect(await screen.findByText('Discard changes?')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalledWith('/settings');
  });

  it('saves changes and navigates to the Settings overview on success', async () => {
    vi.mocked(settingsApi.getByCategory).mockResolvedValue(seoSettings as never);
    vi.mocked(settingsApi.bulkUpdateCategory).mockResolvedValue(seoSettings as never);
    const user = userEvent.setup();
    render(<CategorySettingsPageContent category="seo" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText(/Meta Title/)).toBeInTheDocument());
    await user.clear(screen.getByLabelText(/Meta Title/));
    await user.type(screen.getByLabelText(/Meta Title/), 'New Title');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(settingsApi.bulkUpdateCategory).toHaveBeenCalledWith('seo', {
        settings: [{ key: 'metaTitle', value: 'New Title' }],
      }),
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/settings'));
  });

  it('shows the "Reset to defaults" action only for a user with settings.manage', async () => {
    vi.mocked(settingsApi.getByCategory).mockResolvedValue(seoSettings as never);
    render(<CategorySettingsPageContent category="seo" />, { wrapper: wrapper([]) });

    await waitFor(() => expect(screen.getByLabelText(/Meta Title/)).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Reset to defaults' })).not.toBeInTheDocument();
  });

  it('opens the reset-category confirmation and calls settingsApi.resetCategory on confirm', async () => {
    vi.mocked(settingsApi.getByCategory).mockResolvedValue(seoSettings as never);
    vi.mocked(settingsApi.resetCategory).mockResolvedValue({ resetCount: 1 });
    const user = userEvent.setup();
    render(<CategorySettingsPageContent category="seo" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText(/Meta Title/)).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Reset to defaults' }));
    expect(await screen.findByText(/Reset every setting in "SEO"/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reset category' }));
    await waitFor(() => expect(settingsApi.resetCategory).toHaveBeenCalledWith('seo'));
  });
});
