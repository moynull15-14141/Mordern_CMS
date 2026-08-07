import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaPickerDialog } from './media-picker-dialog';
import { useMediaList } from '../hooks/use-media-list';
import { useFavoriteMediaList, useRecentMediaList } from '../hooks/use-media-engagement';
import { useUploadMedia } from '../hooks/use-upload-media';

vi.mock('../hooks/use-media-list', () => ({ useMediaList: vi.fn() }));
vi.mock('../hooks/use-media-engagement', () => ({
  useRecentMediaList: vi.fn(),
  useFavoriteMediaList: vi.fn(),
}));
vi.mock('../hooks/use-upload-media', () => ({ useUploadMedia: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

const media = {
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
  visibility: 'PUBLIC' as const,
  urls: {},
  blurPlaceholder: null,
  dominantColor: null,
  pinnedAt: null,
  usageCount: 0,
  usages: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

function mockEmptyLists() {
  vi.mocked(useRecentMediaList).mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
  } as never);
  vi.mocked(useFavoriteMediaList).mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
  } as never);
  vi.mocked(useUploadMedia).mockReturnValue({ uploadFile: vi.fn() });
}

describe('MediaPickerDialog', () => {
  it('lists fetched media (Browse tab) and calls onSelect + closes on click', async () => {
    mockEmptyLists();
    vi.mocked(useMediaList).mockReturnValue({
      data: {
        data: [media],
        meta: { pagination: { page: 1, limit: 12, total: 1, hasNext: false, hasPrevious: false } },
      },
      isLoading: false,
      isError: false,
    } as never);
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<MediaPickerDialog open onOpenChange={onOpenChange} onSelect={onSelect} />);

    await user.click(screen.getByText('photo.jpg'));

    expect(onSelect).toHaveBeenCalledWith(media);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('hides the type filter when typeFilter is set', () => {
    mockEmptyLists();
    vi.mocked(useMediaList).mockReturnValue({
      data: {
        data: [],
        meta: { pagination: { page: 1, limit: 12, total: 0, hasNext: false, hasPrevious: false } },
      },
      isLoading: false,
      isError: false,
    } as never);
    render(<MediaPickerDialog open onOpenChange={vi.fn()} onSelect={vi.fn()} typeFilter="IMAGE" />);
    expect(screen.queryByLabelText('Filter by type')).not.toBeInTheDocument();
  });

  it('passes the typeFilter to useMediaList', () => {
    mockEmptyLists();
    vi.mocked(useMediaList).mockReturnValue({
      data: {
        data: [],
        meta: { pagination: { page: 1, limit: 12, total: 0, hasNext: false, hasPrevious: false } },
      },
      isLoading: false,
      isError: false,
    } as never);
    render(<MediaPickerDialog open onOpenChange={vi.fn()} onSelect={vi.fn()} typeFilter="IMAGE" />);
    expect(useMediaList).toHaveBeenCalledWith(expect.objectContaining({ type: 'IMAGE' }), true);
  });

  it('shows an empty state when no media is found', async () => {
    mockEmptyLists();
    vi.mocked(useMediaList).mockReturnValue({
      data: {
        data: [],
        meta: { pagination: { page: 1, limit: 12, total: 0, hasNext: false, hasPrevious: false } },
      },
      isLoading: false,
      isError: false,
    } as never);
    render(<MediaPickerDialog open onOpenChange={vi.fn()} onSelect={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('No media found')).toBeInTheDocument());
  });

  it('uses a custom title when given', () => {
    mockEmptyLists();
    vi.mocked(useMediaList).mockReturnValue({
      data: {
        data: [],
        meta: { pagination: { page: 1, limit: 12, total: 0, hasNext: false, hasPrevious: false } },
      },
      isLoading: false,
      isError: false,
    } as never);
    render(
      <MediaPickerDialog
        open
        onOpenChange={vi.fn()}
        onSelect={vi.fn()}
        title="Choose a featured image"
      />
    );
    expect(screen.getByText('Choose a featured image')).toBeInTheDocument();
  });

  it('switches to the Recent tab and lists recently viewed media', async () => {
    vi.mocked(useMediaList).mockReturnValue({
      data: {
        data: [],
        meta: { pagination: { page: 1, limit: 12, total: 0, hasNext: false, hasPrevious: false } },
      },
      isLoading: false,
      isError: false,
    } as never);
    vi.mocked(useRecentMediaList).mockReturnValue({
      data: [media],
      isLoading: false,
      isError: false,
    } as never);
    vi.mocked(useFavoriteMediaList).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as never);
    vi.mocked(useUploadMedia).mockReturnValue({ uploadFile: vi.fn() });
    const user = userEvent.setup();
    render(<MediaPickerDialog open onOpenChange={vi.fn()} onSelect={vi.fn()} />);

    await user.click(screen.getByRole('tab', { name: 'Recent' }));
    expect(screen.getByText('photo.jpg')).toBeInTheDocument();
  });

  it('switches to the Favorites tab and lists favorited media', async () => {
    vi.mocked(useMediaList).mockReturnValue({
      data: {
        data: [],
        meta: { pagination: { page: 1, limit: 12, total: 0, hasNext: false, hasPrevious: false } },
      },
      isLoading: false,
      isError: false,
    } as never);
    vi.mocked(useRecentMediaList).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as never);
    vi.mocked(useFavoriteMediaList).mockReturnValue({
      data: [media],
      isLoading: false,
      isError: false,
    } as never);
    vi.mocked(useUploadMedia).mockReturnValue({ uploadFile: vi.fn() });
    const user = userEvent.setup();
    render(<MediaPickerDialog open onOpenChange={vi.fn()} onSelect={vi.fn()} />);

    await user.click(screen.getByRole('tab', { name: 'Favorites' }));
    expect(screen.getByText('photo.jpg')).toBeInTheDocument();
  });

  it('switches to the Upload tab, uploads a dropped file, and selects the result', async () => {
    mockEmptyLists();
    vi.mocked(useMediaList).mockReturnValue({
      data: {
        data: [],
        meta: { pagination: { page: 1, limit: 12, total: 0, hasNext: false, hasPrevious: false } },
      },
      isLoading: false,
      isError: false,
    } as never);
    const uploadFile = vi.fn().mockResolvedValue(media);
    vi.mocked(useUploadMedia).mockReturnValue({ uploadFile });
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<MediaPickerDialog open onOpenChange={onOpenChange} onSelect={onSelect} />);

    await user.click(screen.getByRole('tab', { name: 'Upload' }));
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText('Choose files'), file);

    await waitFor(() => expect(uploadFile).toHaveBeenCalled());
    await waitFor(() => expect(onSelect).toHaveBeenCalledWith(media));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
