import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaGrid } from './media-grid';
import type { Media } from '../types/media';

function makeMedia(overrides: Partial<Media> = {}): Media {
  return {
    id: 'm1',
    type: 'IMAGE',
    status: 'READY',
    storageKey: 'uploads/photo.jpg',
    filename: 'photo.jpg',
    folderId: null,
    mimeType: 'image/jpeg',
    filesize: '204800',
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
    ...overrides,
  };
}

const baseProps = {
  data: [makeMedia()],
  onPageChange: vi.fn(),
  onLimitChange: vi.fn(),
  search: '',
  onSearchChange: vi.fn(),
  onView: vi.fn(),
  onDelete: vi.fn(),
  onRestore: vi.fn(),
};

describe('MediaGrid', () => {
  it('renders a card per media item with filename, size, and status', () => {
    render(<MediaGrid {...baseProps} />);
    expect(screen.getByText('photo.jpg')).toBeInTheDocument();
    expect(screen.getByText('200 KB')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('shows a loading skeleton grid while isLoading', () => {
    const { container } = render(<MediaGrid {...baseProps} data={[]} isLoading />);
    expect(container.querySelectorAll('[class*="aspect-square"]').length).toBeGreaterThan(0);
  });

  it('shows the empty state when there is no media', () => {
    render(<MediaGrid {...baseProps} data={[]} />);
    expect(screen.getByText('No media yet')).toBeInTheDocument();
  });

  it('shows the error state and calls onRetry', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<MediaGrid {...baseProps} data={[]} error={new Error('boom')} onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('calls onView when a thumbnail is clicked', async () => {
    const onView = vi.fn();
    const user = userEvent.setup();
    render(<MediaGrid {...baseProps} onView={onView} />);

    await user.click(screen.getByRole('img', { name: 'image file' }));
    expect(onView).toHaveBeenCalledWith(expect.objectContaining({ id: 'm1' }));
  });

  it('calls onDelete via the row action menu', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<MediaGrid {...baseProps} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: 'Actions for photo.jpg' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'm1' }));
  });
});
