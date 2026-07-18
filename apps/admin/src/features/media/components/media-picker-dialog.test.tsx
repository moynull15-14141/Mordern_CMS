import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaPickerDialog } from './media-picker-dialog';
import { useMediaList } from '../hooks/use-media-list';

vi.mock('../hooks/use-media-list', () => ({ useMediaList: vi.fn() }));

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
  usageCount: 0,
  usages: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  deletedAt: null,
};

describe('MediaPickerDialog', () => {
  it('lists fetched media and calls onSelect + closes on click', async () => {
    vi.mocked(useMediaList).mockReturnValue({
      data: { data: [media], meta: { pagination: { page: 1, limit: 12, total: 1, hasNext: false, hasPrevious: false } } },
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
    vi.mocked(useMediaList).mockReturnValue({
      data: { data: [], meta: { pagination: { page: 1, limit: 12, total: 0, hasNext: false, hasPrevious: false } } },
      isLoading: false,
      isError: false,
    } as never);
    render(<MediaPickerDialog open onOpenChange={vi.fn()} onSelect={vi.fn()} typeFilter="IMAGE" />);
    expect(screen.queryByLabelText('Filter by type')).not.toBeInTheDocument();
  });

  it('passes the typeFilter to useMediaList', () => {
    vi.mocked(useMediaList).mockReturnValue({
      data: { data: [], meta: { pagination: { page: 1, limit: 12, total: 0, hasNext: false, hasPrevious: false } } },
      isLoading: false,
      isError: false,
    } as never);
    render(<MediaPickerDialog open onOpenChange={vi.fn()} onSelect={vi.fn()} typeFilter="IMAGE" />);
    expect(useMediaList).toHaveBeenCalledWith(expect.objectContaining({ type: 'IMAGE' }));
  });

  it('shows an empty state when no media is found', async () => {
    vi.mocked(useMediaList).mockReturnValue({
      data: { data: [], meta: { pagination: { page: 1, limit: 12, total: 0, hasNext: false, hasPrevious: false } } },
      isLoading: false,
      isError: false,
    } as never);
    render(<MediaPickerDialog open onOpenChange={vi.fn()} onSelect={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('No media found')).toBeInTheDocument());
  });

  it('uses a custom title when given', () => {
    vi.mocked(useMediaList).mockReturnValue({
      data: { data: [], meta: { pagination: { page: 1, limit: 12, total: 0, hasNext: false, hasPrevious: false } } },
      isLoading: false,
      isError: false,
    } as never);
    render(<MediaPickerDialog open onOpenChange={vi.fn()} onSelect={vi.fn()} title="Choose a featured image" />);
    expect(screen.getByText('Choose a featured image')).toBeInTheDocument();
  });
});
