import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { PageDetailPageContent } from './page-detail-page-content';
import { pagesApi } from '../services/pages.api';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../services/pages.api', () => ({
  pagesApi: { get: vi.fn(), remove: vi.fn(), restore: vi.fn(), publish: vi.fn() },
}));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper(permissions: string[] = ['page.manage']) {
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

const page = {
  id: 'p1',
  title: 'About Us',
  slug: 'about-us',
  body: { text: 'x' },
  status: 'DRAFT' as const,
  publishedAt: null,
  seo: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

describe('PageDetailPageContent', () => {
  it('renders page metadata', async () => {
    vi.mocked(pagesApi.get).mockResolvedValue(page);
    render(<PageDetailPageContent pageId="p1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getAllByText('About Us').length).toBeGreaterThan(0));
    expect(screen.getByText('about-us')).toBeInTheDocument();
  });

  it('shows a Publish action for a non-published page and navigates to edit', async () => {
    vi.mocked(pagesApi.get).mockResolvedValue(page);
    const user = userEvent.setup();
    render(<PageDetailPageContent pageId="p1" />, { wrapper: wrapper() });

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument()
    );

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(pushMock).toHaveBeenCalledWith('/pages/p1/edit');
  });

  it('does not show Publish for an already-published page', async () => {
    vi.mocked(pagesApi.get).mockResolvedValue({
      ...page,
      status: 'PUBLISHED',
      publishedAt: '2026-01-03T00:00:00.000Z',
    });
    render(<PageDetailPageContent pageId="p1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getAllByText('Published').length).toBeGreaterThan(0));
    expect(screen.queryByRole('button', { name: 'Publish' })).not.toBeInTheDocument();
  });

  it('confirms and calls pagesApi.remove on Delete', async () => {
    vi.mocked(pagesApi.get).mockResolvedValue(page);
    vi.mocked(pagesApi.remove).mockResolvedValue(page);
    const user = userEvent.setup();
    render(<PageDetailPageContent pageId="p1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(await screen.findByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(pagesApi.remove).toHaveBeenCalledWith('p1'));
  });

  it('shows Restore instead of Edit/Delete for a soft-deleted page', async () => {
    vi.mocked(pagesApi.get).mockResolvedValue({ ...page, deletedAt: '2026-01-05T00:00:00.000Z' });
    render(<PageDetailPageContent pageId="p1" />, { wrapper: wrapper() });

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument()
    );
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
  });

  it('publishes the page when confirmed', async () => {
    vi.mocked(pagesApi.get).mockResolvedValue(page);
    vi.mocked(pagesApi.publish).mockResolvedValue({ ...page, status: 'PUBLISHED' });
    const user = userEvent.setup();
    render(<PageDetailPageContent pageId="p1" />, { wrapper: wrapper() });

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument()
    );
    await user.click(screen.getByRole('button', { name: 'Publish' }));
    await user.click(await screen.findByRole('button', { name: 'Publish' }));

    await waitFor(() => expect(pagesApi.publish).toHaveBeenCalledWith('p1'));
  });
});
