import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ImportThemeDialog } from './import-theme-dialog';
import { themesApi } from '../services/themes.api';

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

function makeFile(content: unknown): File {
  return new File([JSON.stringify(content)], 'theme.json', { type: 'application/json' });
}

describe('ImportThemeDialog', () => {
  it('validates the uploaded file and enables Import once it parses successfully', async () => {
    const user = userEvent.setup();
    render(<ImportThemeDialog open onOpenChange={vi.fn()} onImported={vi.fn()} />, {
      wrapper: wrapper(),
    });

    await user.upload(
      document.querySelector('input[type="file"]') as HTMLInputElement,
      makeFile({ name: 'My Theme' })
    );

    await waitFor(() => expect(screen.getByText(/Ready to import "My Theme"/)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Import' })).toBeEnabled();
  });

  it('shows an inline error for an invalid file and keeps Import disabled', async () => {
    const user = userEvent.setup();
    render(<ImportThemeDialog open onOpenChange={vi.fn()} onImported={vi.fn()} />, {
      wrapper: wrapper(),
    });

    await user.upload(
      document.querySelector('input[type="file"]') as HTMLInputElement,
      makeFile({ notName: 'oops' })
    );

    await waitFor(() => expect(screen.getByRole('button', { name: 'Import' })).toBeDisabled());
  });

  it('clicking Import calls themesApi.create and reports the created theme', async () => {
    vi.mocked(themesApi.create).mockResolvedValue({
      id: 'theme-9',
      name: 'My Theme',
      slug: 'my-theme',
      version: null,
      author: null,
      description: null,
      thumbnail: null,
      status: 'DRAFT',
      isActive: false,
      settings: null,
      createdAt: '',
      updatedAt: '',
      deletedAt: null,
    });
    const onImported = vi.fn();
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<ImportThemeDialog open onOpenChange={onOpenChange} onImported={onImported} />, {
      wrapper: wrapper(),
    });

    await user.upload(
      document.querySelector('input[type="file"]') as HTMLInputElement,
      makeFile({ name: 'My Theme' })
    );
    await waitFor(() => expect(screen.getByRole('button', { name: 'Import' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Import' }));

    await waitFor(() =>
      expect(themesApi.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'My Theme' }))
    );
    await waitFor(() =>
      expect(onImported).toHaveBeenCalledWith(expect.objectContaining({ id: 'theme-9' }))
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
