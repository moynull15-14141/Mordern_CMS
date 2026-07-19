import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { EditLayoutPageContent } from './edit-layout-page-content';
import { layoutsApi } from '../services/layouts.api';
import { useThemes } from '@/features/themes';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/layouts.api', () => ({ layoutsApi: { get: vi.fn(), update: vi.fn() } }));
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

const targetLayout = {
  id: 'l1',
  name: 'Sidebar Left',
  slug: 'sidebar-left',
  status: 'DRAFT' as const,
  layoutPreset: 'sidebar-left',
  themeId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

describe('EditLayoutPageContent', () => {
  it('loads the layout by id and pre-fills the form', async () => {
    vi.mocked(useThemes).mockReturnValue({ data: { data: [], meta: {} }, isError: false } as never);
    vi.mocked(layoutsApi.get).mockResolvedValue(targetLayout);
    render(<EditLayoutPageContent layoutId="l1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveValue('Sidebar Left'));
    expect(layoutsApi.get).toHaveBeenCalledWith('l1');
  });

  it('navigates to the detail page without a confirm dialog when Cancel is clicked and the form is clean', async () => {
    vi.mocked(useThemes).mockReturnValue({ data: { data: [], meta: {} }, isError: false } as never);
    vi.mocked(layoutsApi.get).mockResolvedValue(targetLayout);
    const user = userEvent.setup();
    render(<EditLayoutPageContent layoutId="l1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Name')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(pushMock).toHaveBeenCalledWith('/layouts/l1');
    expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument();
  });

  it('shows a discard-changes confirmation when Cancel is clicked with unsaved edits', async () => {
    vi.mocked(useThemes).mockReturnValue({ data: { data: [], meta: {} }, isError: false } as never);
    vi.mocked(layoutsApi.get).mockResolvedValue(targetLayout);
    const user = userEvent.setup();
    render(<EditLayoutPageContent layoutId="l1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Name')).toBeInTheDocument());
    await user.type(screen.getByLabelText('Name'), '!');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(await screen.findByText('Discard changes?')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalledWith('/layouts/l1');
  });

  it('saves changes and navigates to the detail page on success', async () => {
    vi.mocked(useThemes).mockReturnValue({ data: { data: [], meta: {} }, isError: false } as never);
    vi.mocked(layoutsApi.get).mockResolvedValue(targetLayout);
    vi.mocked(layoutsApi.update).mockResolvedValue({ ...targetLayout, name: 'New Name' });
    const user = userEvent.setup();
    render(<EditLayoutPageContent layoutId="l1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Name')).toBeInTheDocument());
    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'New Name');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(layoutsApi.update).toHaveBeenCalledWith(
        'l1',
        expect.objectContaining({ name: 'New Name' })
      )
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/layouts/l1'));
  });
});
