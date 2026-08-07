import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { MediaRefField } from './media-ref-field';
import { mediaApi } from '@/features/media/services/media.api';

vi.mock('@/features/media/services/media.api', () => ({
  mediaApi: { get: vi.fn(), list: vi.fn() },
}));

function makeMedia(overrides: Record<string, unknown> = {}) {
  return {
    id: 'media-1',
    type: 'IMAGE',
    status: 'READY',
    storageKey: 'uploads/photo.png',
    filename: 'photo.png',
    folderId: null,
    mimeType: 'image/png',
    filesize: '1024',
    width: 800,
    height: 600,
    duration: null,
    altText: null,
    caption: null,
    credit: null,
    uploadedBy: 'user-1',
    visibility: 'PUBLIC',
    urls: { original: 'https://cdn.example.com/photo.png' },
    blurPlaceholder: null,
    dominantColor: null,
    pinnedAt: null,
    usageCount: 0,
    usages: [],
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
    ...overrides,
  };
}

const emptyListResponse = {
  success: true,
  message: 'ok',
  data: [],
  meta: { pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } },
  errors: [],
};

beforeEach(() => {
  // MediaPickerDialog's own useMediaList query runs regardless of the
  // Drawer's visual open state (it isn't unmounted, only hidden) — give it
  // a default resolved value so tests that never open the picker don't
  // trip React Query's "query data cannot be undefined" warning.
  (mediaApi.list as ReturnType<typeof vi.fn>).mockResolvedValue(emptyListResponse);
});

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('MediaRefField', () => {
  it('shows a placeholder trigger when no media is selected', () => {
    render(
      <MediaRefField
        descriptor={{ key: 'mediaId', label: 'Image', kind: 'media-ref' }}
        value=""
        onChange={vi.fn()}
      />,
      { wrapper: wrapper() }
    );
    expect(screen.getByRole('button', { name: 'Image' })).toHaveTextContent('Choose image…');
  });

  it('shows the selected media thumbnail + filename once resolved', async () => {
    (mediaApi.get as ReturnType<typeof vi.fn>).mockResolvedValue(makeMedia());
    render(
      <MediaRefField
        descriptor={{ key: 'mediaId', label: 'Image', kind: 'media-ref' }}
        value="media-1"
        onChange={vi.fn()}
      />,
      { wrapper: wrapper() }
    );
    await waitFor(() => expect(screen.getByText('photo.png')).toBeInTheDocument());
    expect(mediaApi.get).toHaveBeenCalledWith('media-1');
  });

  it('clears the value when Clear is clicked', async () => {
    (mediaApi.get as ReturnType<typeof vi.fn>).mockResolvedValue(makeMedia());
    const onChange = vi.fn();
    render(
      <MediaRefField
        descriptor={{ key: 'mediaId', label: 'Image', kind: 'media-ref' }}
        value="media-1"
        onChange={onChange}
      />,
      { wrapper: wrapper() }
    );
    await waitFor(() => expect(screen.getByText('photo.png')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('opens the picker Drawer and selects a media asset, calling onChange with its id', async () => {
    (mediaApi.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      message: 'ok',
      data: [makeMedia({ id: 'media-2', filename: 'other.png' })],
      meta: { pagination: { page: 1, limit: 12, total: 1, totalPages: 1 } },
      errors: [],
    });
    const onChange = vi.fn();
    render(
      <MediaRefField
        descriptor={{ key: 'mediaId', label: 'Image', kind: 'media-ref' }}
        value=""
        onChange={onChange}
      />,
      { wrapper: wrapper() }
    );

    await userEvent.click(screen.getByRole('button', { name: 'Image' }));
    await waitFor(() => expect(screen.getByText('other.png')).toBeInTheDocument());
    await userEvent.click(screen.getByText('other.png'));

    expect(onChange).toHaveBeenCalledWith('media-2');
  });

  it('passes descriptor.mediaTypeFilter through to the picker', async () => {
    (mediaApi.list as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      message: 'ok',
      data: [],
      meta: { pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } },
      errors: [],
    });
    render(
      <MediaRefField
        descriptor={{ key: 'mediaId', label: 'Image', kind: 'media-ref', mediaTypeFilter: 'IMAGE' }}
        value=""
        onChange={vi.fn()}
      />,
      { wrapper: wrapper() }
    );
    await userEvent.click(screen.getByRole('button', { name: 'Image' }));
    await waitFor(() =>
      expect(mediaApi.list).toHaveBeenCalledWith(expect.objectContaining({ type: 'IMAGE' }))
    );
  });
});
