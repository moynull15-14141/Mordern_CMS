import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { EditPagePageContent } from './edit-page-page-content';
import { pagesApi } from '../services/pages.api';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/pages.api', () => ({ pagesApi: { get: vi.fn(), update: vi.fn() } }));
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

const targetPage = {
  id: 'p1',
  title: 'About Us',
  slug: 'about-us',
  body: { text: 'Original content' },
  status: 'DRAFT' as const,
  publishedAt: null,
  seo: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

describe('EditPagePageContent', () => {
  it('loads the page by id and pre-fills the form', async () => {
    vi.mocked(pagesApi.get).mockResolvedValue(targetPage);
    render(<EditPagePageContent pageId="p1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Title')).toHaveValue('About Us'));
    expect(screen.getByLabelText(/Content/)).toHaveValue('Original content');
    expect(pagesApi.get).toHaveBeenCalledWith('p1');
  });

  it('navigates to the detail page without a confirm dialog when Cancel is clicked and the form is clean', async () => {
    vi.mocked(pagesApi.get).mockResolvedValue(targetPage);
    const user = userEvent.setup();
    render(<EditPagePageContent pageId="p1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Title')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(pushMock).toHaveBeenCalledWith('/pages/p1');
    expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument();
  });

  it('shows a discard-changes confirmation when Cancel is clicked with unsaved edits', async () => {
    vi.mocked(pagesApi.get).mockResolvedValue(targetPage);
    const user = userEvent.setup();
    render(<EditPagePageContent pageId="p1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Title')).toBeInTheDocument());
    await user.type(screen.getByLabelText('Title'), '!');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(await screen.findByText('Discard changes?')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalledWith('/pages/p1');
  });

  it('saves changes and navigates to the detail page on success', async () => {
    vi.mocked(pagesApi.get).mockResolvedValue(targetPage);
    vi.mocked(pagesApi.update).mockResolvedValue({ ...targetPage, title: 'New Title' });
    const user = userEvent.setup();
    render(<EditPagePageContent pageId="p1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByLabelText('Title')).toBeInTheDocument());
    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'New Title');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(pagesApi.update).toHaveBeenCalledWith(
        'p1',
        expect.objectContaining({ title: 'New Title' })
      )
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/pages/p1'));
  });
});
