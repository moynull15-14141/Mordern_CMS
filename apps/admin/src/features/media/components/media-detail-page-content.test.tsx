import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { MediaDetailPageContent } from './media-detail-page-content';
import { mediaApi } from '../services/media.api';
import { PermissionContext, type PermissionContextValue } from '@/providers/permission-provider';

vi.mock('../services/media.api', () => ({
  mediaApi: {
    get: vi.fn(),
    getUsages: vi.fn(),
    getDuplicates: vi.fn(),
    update: vi.fn(),
    rename: vi.fn(),
    move: vi.fn(),
    remove: vi.fn(),
    restore: vi.fn(),
  },
}));
vi.mock('../services/media-folders.api', () => ({ mediaFoldersApi: { getTree: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

function wrapper(permissions: string[] = ['media.upload', 'media.delete']) {
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

const media = {
  id: 'm1',
  type: 'IMAGE' as const,
  status: 'READY' as const,
  storageKey: 'uploads/photo.jpg',
  filename: 'photo.jpg',
  folderId: null,
  mimeType: 'image/jpeg',
  filesize: '204800',
  width: 800,
  height: 600,
  duration: null,
  altText: 'A photo',
  caption: null,
  credit: null,
  uploadedBy: 'u1',
  usageCount: 0,
  usages: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('MediaDetailPageContent', () => {
  it('renders every field MediaResponseDto returns', async () => {
    vi.mocked(mediaApi.get).mockResolvedValue(media);
    vi.mocked(mediaApi.getUsages).mockResolvedValue([]);
    vi.mocked(mediaApi.getDuplicates).mockResolvedValue([]);
    render(<MediaDetailPageContent mediaId="m1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getAllByText('photo.jpg').length).toBeGreaterThan(0));
    expect(screen.getByText('image/jpeg')).toBeInTheDocument();
    expect(screen.getByText('uploads/photo.jpg')).toBeInTheDocument();
    expect(screen.getByText('200 KB')).toBeInTheDocument();
    expect(screen.getByText('800×600')).toBeInTheDocument();
    expect(screen.getByText('A photo')).toBeInTheDocument();
    expect(screen.getByText('u1')).toBeInTheDocument();
  });

  it('shows no preview/download note (no file-serving endpoint exists)', async () => {
    vi.mocked(mediaApi.get).mockResolvedValue(media);
    vi.mocked(mediaApi.getUsages).mockResolvedValue([]);
    vi.mocked(mediaApi.getDuplicates).mockResolvedValue([]);
    render(<MediaDetailPageContent mediaId="m1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByText(/No preview or download is available/)).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: /download/i })).not.toBeInTheDocument();
  });

  it('opens the rename dialog and calls mediaApi.rename on submit', async () => {
    vi.mocked(mediaApi.get).mockResolvedValue(media);
    vi.mocked(mediaApi.getUsages).mockResolvedValue([]);
    vi.mocked(mediaApi.getDuplicates).mockResolvedValue([]);
    vi.mocked(mediaApi.rename).mockResolvedValue({ ...media, filename: 'new.jpg' });
    const user = userEvent.setup();
    render(<MediaDetailPageContent mediaId="m1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Rename' })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Rename' }));
    await user.clear(screen.getByLabelText('Filename'));
    await user.type(screen.getByLabelText('Filename'), 'new.jpg');
    await user.click(screen.getByRole('button', { name: 'Rename' }));

    await waitFor(() => expect(mediaApi.rename).toHaveBeenCalledWith('m1', { filename: 'new.jpg' }));
  });

  it('confirms and calls mediaApi.remove on Delete', async () => {
    vi.mocked(mediaApi.get).mockResolvedValue(media);
    vi.mocked(mediaApi.getUsages).mockResolvedValue([]);
    vi.mocked(mediaApi.getDuplicates).mockResolvedValue([]);
    vi.mocked(mediaApi.remove).mockResolvedValue(media);
    const user = userEvent.setup();
    render(<MediaDetailPageContent mediaId="m1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(await screen.findByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(mediaApi.remove).toHaveBeenCalledWith('m1'));
  });

  it('shows Restore instead of Edit/Rename/Move/Delete for a soft-deleted asset', async () => {
    vi.mocked(mediaApi.get).mockResolvedValue({ ...media, deletedAt: '2026-01-05T00:00:00.000Z' });
    vi.mocked(mediaApi.getUsages).mockResolvedValue([]);
    vi.mocked(mediaApi.getDuplicates).mockResolvedValue([]);
    render(<MediaDetailPageContent mediaId="m1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Edit metadata' })).not.toBeInTheDocument();
  });

  it('shows usage info when the asset is referenced', async () => {
    vi.mocked(mediaApi.get).mockResolvedValue(media);
    vi.mocked(mediaApi.getUsages).mockResolvedValue([
      { source: 'Article.featuredMedia', id: 'a1', label: 'Hello World' },
    ]);
    vi.mocked(mediaApi.getDuplicates).mockResolvedValue([]);
    render(<MediaDetailPageContent mediaId="m1" />, { wrapper: wrapper() });

    await waitFor(() => expect(screen.getByText('Hello World')).toBeInTheDocument());
  });
});
