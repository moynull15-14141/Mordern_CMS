import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { MediaListPageContent } from './media-list-page-content';
import { mediaApi } from '../services/media.api';
import { mediaFoldersApi } from '../services/media-folders.api';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

const pushMock = vi.fn();
let currentSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => currentSearchParams,
}));

vi.mock('../services/media.api', () => ({ mediaApi: { list: vi.fn(), remove: vi.fn(), restore: vi.fn() } }));
vi.mock('../services/media-folders.api', () => ({ mediaFoldersApi: { getTree: vi.fn() } }));
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

const oneMedia = {
  id: 'm1',
  type: 'IMAGE' as const,
  status: 'READY' as const,
  storageKey: 'uploads/photo.jpg',
  filename: 'photo.jpg',
  folderId: null,
  mimeType: 'image/jpeg',
  filesize: '2048',
  width: 800,
  height: 600,
  duration: null,
  altText: null,
  caption: null,
  credit: null,
  uploadedBy: 'u1',
  usageCount: 0,
  usages: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

beforeEach(() => {
  currentSearchParams = new URLSearchParams();
  vi.clearAllMocks();
  vi.mocked(mediaFoldersApi.getTree).mockResolvedValue([]);
});

describe('MediaListPageContent', () => {
  it('renders the page title and media in Grid view by default', async () => {
    vi.mocked(mediaApi.list).mockResolvedValue({
      data: [oneMedia],
      meta: { pagination: { page: 1, limit: 24, total: 1, hasNext: false, hasPrevious: false } },
    });
    render(<MediaListPageContent />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByText('photo.jpg')).toBeInTheDocument());
  });

  it('switches to List view via the view toggle', async () => {
    currentSearchParams = new URLSearchParams({ view: 'list' });
    vi.mocked(mediaApi.list).mockResolvedValue({
      data: [oneMedia],
      meta: { pagination: { page: 1, limit: 24, total: 1, hasNext: false, hasPrevious: false } },
    });
    render(<MediaListPageContent />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByText('photo.jpg')).toBeInTheDocument());
    expect(screen.getByRole('columnheader', { name: /Filename/ })).toBeInTheDocument();
  });

  it('shows the "Upload media" button only for a user with media.upload', async () => {
    vi.mocked(mediaApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 24, total: 0, hasNext: false, hasPrevious: false } },
    });
    render(<MediaListPageContent />, { wrapper: wrapper([]) });
    await waitFor(() => expect(mediaApi.list).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'Upload media' })).not.toBeInTheDocument();
  });

  it('navigates to /media/upload when "Upload media" is clicked', async () => {
    vi.mocked(mediaApi.list).mockResolvedValue({
      data: [],
      meta: { pagination: { page: 1, limit: 24, total: 0, hasNext: false, hasPrevious: false } },
    });
    const user = userEvent.setup();
    render(<MediaListPageContent />, { wrapper: wrapper(['media.upload']) });

    await user.click(await screen.findByRole('button', { name: 'Upload media' }));
    expect(pushMock).toHaveBeenCalledWith('/media/upload');
  });

  it('opens the delete confirmation and calls mediaApi.remove on confirm', async () => {
    vi.mocked(mediaApi.list).mockResolvedValue({
      data: [oneMedia],
      meta: { pagination: { page: 1, limit: 24, total: 1, hasNext: false, hasPrevious: false } },
    });
    vi.mocked(mediaApi.remove).mockResolvedValue(oneMedia);
    const user = userEvent.setup();
    render(<MediaListPageContent />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByText('photo.jpg')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Actions for photo.jpg' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(mediaApi.remove).toHaveBeenCalledWith('m1'));
  });
});
