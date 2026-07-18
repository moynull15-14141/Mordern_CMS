import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaTable } from './media-table';
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
  sorting: [],
  onSortingChange: vi.fn(),
  search: '',
  onSearchChange: vi.fn(),
  onView: vi.fn(),
  onDelete: vi.fn(),
  onRestore: vi.fn(),
};

describe('MediaTable', () => {
  it('renders filename, type, status, size, and dimensions', () => {
    render(<MediaTable {...baseProps} />);
    expect(screen.getByText('photo.jpg')).toBeInTheDocument();
    expect(screen.getByText('Image')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByText('200 KB')).toBeInTheDocument();
    expect(screen.getByText('800×600')).toBeInTheDocument();
  });

  it('shows View/Delete actions, no Edit action, for a non-deleted asset', async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<MediaTable {...baseProps} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: 'Actions for photo.jpg' }));
    expect(screen.queryByRole('menuitem', { name: 'Edit' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'm1' }));
  });

  it('shows Restore instead of Delete for a soft-deleted asset', async () => {
    const onRestore = vi.fn();
    const user = userEvent.setup();
    const deleted = makeMedia({ deletedAt: '2026-01-03T00:00:00.000Z' });
    render(<MediaTable {...baseProps} data={[deleted]} onRestore={onRestore} />);

    await user.click(screen.getByRole('button', { name: 'Actions for photo.jpg' }));
    expect(screen.getByRole('menuitem', { name: 'Restore' })).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Restore' }));
    expect(onRestore).toHaveBeenCalledWith(expect.objectContaining({ id: 'm1' }));
  });

  it('renders the empty state when there is no media', () => {
    render(<MediaTable {...baseProps} data={[]} />);
    expect(screen.getByText('No media yet')).toBeInTheDocument();
  });
});
