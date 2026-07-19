import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { CreateLayoutPageContent } from './create-layout-page-content';
import { layoutsApi } from '../services/layouts.api';
import { useThemes } from '@/features/themes';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/layouts.api', () => ({ layoutsApi: { create: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock('@/features/themes', () => ({ useThemes: vi.fn() }));

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

describe('CreateLayoutPageContent', () => {
  it('submits the form and navigates to the detail page on success', async () => {
    vi.mocked(useThemes).mockReturnValue({ data: { data: [], meta: {} }, isError: false } as never);
    vi.mocked(layoutsApi.create).mockResolvedValue({ id: 'l1' } as never);
    const user = userEvent.setup();
    render(<CreateLayoutPageContent />, { wrapper: wrapper() });

    await user.type(screen.getByLabelText('Name'), 'Sidebar Left');
    await user.click(screen.getByLabelText('Layout preset'));
    await user.click(await screen.findByRole('option', { name: 'Sidebar Left' }));
    await user.click(screen.getByRole('button', { name: 'Create layout' }));

    await waitFor(() =>
      expect(layoutsApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Sidebar Left', layoutPreset: 'sidebar-left' })
      )
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/layouts/l1'));
  });

  it('omits themeId when no theme compatibility is chosen', async () => {
    vi.mocked(useThemes).mockReturnValue({ data: { data: [], meta: {} }, isError: false } as never);
    vi.mocked(layoutsApi.create).mockResolvedValue({ id: 'l1' } as never);
    const user = userEvent.setup();
    render(<CreateLayoutPageContent />, { wrapper: wrapper() });

    await user.type(screen.getByLabelText('Name'), 'Default');
    await user.click(screen.getByLabelText('Layout preset'));
    await user.click(await screen.findByRole('option', { name: 'Default' }));
    await user.click(screen.getByRole('button', { name: 'Create layout' }));

    await waitFor(() =>
      expect(layoutsApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ themeId: undefined })
      )
    );
  });
});
