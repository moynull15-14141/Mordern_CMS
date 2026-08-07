import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { CreateThemePageContent } from './create-theme-page-content';
import { themesApi } from '../services/themes.api';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/themes.api', () => ({ themesApi: { create: vi.fn() } }));
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

describe('CreateThemePageContent', () => {
  it('submits the form and navigates to the detail page on success', async () => {
    vi.mocked(themesApi.create).mockResolvedValue({ id: 't1' } as never);
    const user = userEvent.setup();
    render(<CreateThemePageContent />, { wrapper: wrapper() });

    await user.type(screen.getByLabelText('Name'), 'Classic');
    await user.click(screen.getByRole('button', { name: 'Create theme' }));

    await waitFor(() =>
      expect(themesApi.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Classic' }))
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/themes/t1'));
  });

  it('strips empty settings fields, sending settings=undefined when nothing was filled', async () => {
    vi.mocked(themesApi.create).mockResolvedValue({ id: 't1' } as never);
    const user = userEvent.setup();
    render(<CreateThemePageContent />, { wrapper: wrapper() });

    await user.type(screen.getByLabelText('Name'), 'Classic');
    await user.click(screen.getByRole('button', { name: 'Create theme' }));

    await waitFor(() =>
      expect(themesApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ settings: undefined })
      )
    );
  });

  it('includes a filled-in primaryColor in the settings payload', async () => {
    vi.mocked(themesApi.create).mockResolvedValue({ id: 't1' } as never);
    const user = userEvent.setup();
    render(<CreateThemePageContent />, { wrapper: wrapper() });

    await user.type(screen.getByLabelText('Name'), 'Classic');
    await user.click(screen.getByRole('tab', { name: 'Advanced' }));
    await user.type(screen.getByLabelText('Primary Color'), '#112233');
    await user.click(screen.getByRole('button', { name: 'Create theme' }));

    await waitFor(() =>
      expect(themesApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ settings: expect.objectContaining({ primaryColor: '#112233' }) })
      )
    );
  });

  // Regression test: designTokens (everything entered in the Site Design
  // Colors/Typography/Buttons/… tabs) was being silently dropped from the
  // create payload — `toSettingsInput` rebuilt `settings` from only the
  // legacy flat fields and never copied `values.settings.designTokens`
  // across, so nothing set via the new tabs was ever actually saved.
  it('includes designTokens set via the Site Design Colors tab in the settings payload', async () => {
    vi.mocked(themesApi.create).mockResolvedValue({ id: 't1' } as never);
    const user = userEvent.setup();
    render(<CreateThemePageContent />, { wrapper: wrapper() });

    await user.type(screen.getByLabelText('Name'), 'Classic');
    await user.click(screen.getByRole('tab', { name: 'Colors' }));
    await user.type(screen.getByLabelText('Primary'), '#654321');
    await user.click(screen.getByRole('button', { name: 'Create theme' }));

    await waitFor(() =>
      expect(themesApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          settings: expect.objectContaining({
            designTokens: expect.objectContaining({
              colors: expect.objectContaining({
                brand: expect.objectContaining({ primary: '#654321' }),
              }),
            }),
          }),
        })
      )
    );
  });
});
