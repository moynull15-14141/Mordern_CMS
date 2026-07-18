import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadQueueItemCard } from './upload-queue-item';
import { useMediaFolderTree } from '../hooks/use-media-folder-tree';
import type { UploadQueueItem } from './upload-queue.types';

vi.mock('../hooks/use-media-folder-tree', () => ({ useMediaFolderTree: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

function makeItem(overrides: Partial<UploadQueueItem> = {}): UploadQueueItem {
  return {
    localId: 'q1',
    file: new File(['x'], 'photo.jpg', { type: 'image/jpeg' }),
    previewUrl: null,
    metadata: { filename: 'photo.jpg', mimeType: 'image/jpeg', filesize: '2048', type: 'IMAGE', width: 800, height: 600 },
    storageKey: '',
    folderId: '',
    altText: '',
    caption: '',
    credit: '',
    status: 'pending',
    errorMessage: null,
    result: null,
    abortController: null,
    ...overrides,
  };
}

describe('UploadQueueItemCard', () => {
  it('renders extracted metadata and a Pending badge', () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [], isError: false } as never);
    render(<UploadQueueItemCard item={makeItem()} onChange={vi.fn()} onRemove={vi.fn()} onRetry={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText('photo.jpg')).toBeInTheDocument();
    expect(screen.getByText(/800×600/)).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('calls onChange when the storage key is edited', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [], isError: false } as never);
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<UploadQueueItemCard item={makeItem()} onChange={onChange} onRemove={vi.fn()} onRetry={vi.fn()} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText('Storage key'), 'a');
    expect(onChange).toHaveBeenCalledWith('q1', { storageKey: 'a' });
  });

  it('shows a Cancel button while submitting, and calls onCancel', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [], isError: false } as never);
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(
      <UploadQueueItemCard
        item={makeItem({ status: 'submitting' })}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onRetry={vi.fn()}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText('Registering…')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledWith('q1');
  });

  it('shows a Retry button and error message on failure', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [], isError: false } as never);
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(
      <UploadQueueItemCard
        item={makeItem({ status: 'error', errorMessage: 'Storage key is required.' })}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onRetry={onRetry}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText('Storage key is required.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledWith('q1');
  });

  it('disables inputs and shows a Registered badge on success', () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [], isError: false } as never);
    render(
      <UploadQueueItemCard
        item={makeItem({ status: 'success' })}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onRetry={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText('Registered')).toBeInTheDocument();
    expect(screen.getByLabelText('Storage key')).toBeDisabled();
  });

  it('calls onRemove when Remove is clicked', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [], isError: false } as never);
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(<UploadQueueItemCard item={makeItem()} onChange={vi.fn()} onRemove={onRemove} onRetry={vi.fn()} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /Remove/ }));
    expect(onRemove).toHaveBeenCalledWith('q1');
  });
});
