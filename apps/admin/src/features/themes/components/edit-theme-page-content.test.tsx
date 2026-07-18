import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { EditThemePageContent } from './edit-theme-page-content';
import { themesApi } from '../services/themes.api';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/themes.api', () => ({ themesApi: { get: vi.fn(), update: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const targetTheme = {
  id: 't1',
  name: 'Classic',
  slug: 'classic',
  version: '1.0.0',
  author: 'Acme',
  description: null,
  thumbnail: null,
  status: 'DRAFT' as const,
  isActive: false,
  settings: { primaryColor: '#112233' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

describe('EditThemePageContent', () => {
  it('loads the theme by id and pre-fills the form', async () => {
    vi.mocked(themesApi.get).mockResolvedValue(targetTheme);
    render(<EditThemePageContent themeId="t1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue('Classic'));
    expect(screen.getByLabelText('Version')).toHaveValue('1.0.0');
    expect(themesApi.get).toHaveBeenCalledWith('t1');
  });

  it('pre-fills appearance settings from the theme', async () => {
    vi.mocked(themesApi.get).mockResolvedValue(targetTheme);
    render(<EditThemePageContent themeId="t1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Primary Color')).toBeInTheDocument());
  });

  it('navigates to the detail page without a confirm dialog when Cancel is clicked and the form is clean', async () => {
    vi.mocked(themesApi.get).mockResolvedValue(targetTheme);
    const user = userEvent.setup();
    render(<EditThemePageContent themeId="t1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Name')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(pushMock).toHaveBeenCalledWith('/themes/t1');
    expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument();
  });

  it('shows a discard-changes confirmation when Cancel is clicked with unsaved edits', async () => {
    vi.mocked(themesApi.get).mockResolvedValue(targetTheme);
    const user = userEvent.setup();
    render(<EditThemePageContent themeId="t1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Name')).toBeInTheDocument());
    await user.type(screen.getByLabelText('Name'), '!');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(await screen.findByText('Discard changes?')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalledWith('/themes/t1');
  });

  it('saves changes and navigates to the detail page on success', async () => {
    vi.mocked(themesApi.get).mockResolvedValue(targetTheme);
    vi.mocked(themesApi.update).mockResolvedValue({ ...targetTheme, name: 'New Name' });
    const user = userEvent.setup();
    render(<EditThemePageContent themeId="t1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Name')).toBeInTheDocument());
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'New Name');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(themesApi.update).toHaveBeenCalledWith(
        't1',
        expect.objectContaining({ name: 'New Name' })
      )
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/themes/t1'));
  });
});
