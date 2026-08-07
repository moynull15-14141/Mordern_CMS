import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadPageContent } from './upload-page-content';
import { useUploadMedia } from '../hooks/use-upload-media';
import { useMediaFolderTree } from '../hooks/use-media-folder-tree';
import type { UploadMediaOptions } from '../hooks/use-upload-media';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../hooks/use-upload-media', () => ({ useUploadMedia: vi.fn() }));
vi.mock('../hooks/use-media-folder-tree', () => ({ useMediaFolderTree: vi.fn() }));

function makeFile(name: string, type: string): File {
  return new File(['x'], name, { type });
}

function makeReadyMedia(overrides: Record<string, unknown> = {}) {
  return { id: 'm1', status: 'READY', ...overrides };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('UploadPageContent', () => {
  it('queues a selected file and extracts its metadata', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [], isError: false } as never);
    vi.mocked(useUploadMedia).mockReturnValue({ uploadFile: vi.fn() });
    const user = userEvent.setup();
    render(<UploadPageContent />);

    await user.upload(
      screen.getByLabelText('Choose files'),
      makeFile('report.pdf', 'application/pdf')
    );

    await waitFor(() => expect(screen.getByText('report.pdf')).toBeInTheDocument());
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('uploads a file via the real transport and shows Uploaded on success', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [], isError: false } as never);
    const uploadFile = vi.fn().mockImplementation(async (options: UploadMediaOptions) => {
      options.onStatusChange('uploading');
      options.onProgress(100);
      options.onStatusChange('success');
      return makeReadyMedia();
    });
    vi.mocked(useUploadMedia).mockReturnValue({ uploadFile });
    const user = userEvent.setup();
    render(<UploadPageContent />);

    await user.upload(
      screen.getByLabelText('Choose files'),
      makeFile('report.pdf', 'application/pdf')
    );
    await waitFor(() => expect(screen.getByText('report.pdf')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Upload 1 file' }));

    await waitFor(() => expect(uploadFile).toHaveBeenCalled());
    expect(uploadFile.mock.calls[0][0].input).toMatchObject({
      filename: 'report.pdf',
      type: 'DOCUMENT',
    });
    await waitFor(() => expect(screen.getByText('Uploaded')).toBeInTheDocument());
  });

  it('shows an error and a Retry button when the upload fails', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [], isError: false } as never);
    const uploadFile = vi.fn().mockRejectedValue(new Error('Server error'));
    vi.mocked(useUploadMedia).mockReturnValue({ uploadFile });
    const user = userEvent.setup();
    render(<UploadPageContent />);

    await user.upload(
      screen.getByLabelText('Choose files'),
      makeFile('report.pdf', 'application/pdf')
    );
    await waitFor(() => expect(screen.getByText('report.pdf')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Upload 1 file' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument());
  });

  it('removes a queued item from the list', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [], isError: false } as never);
    vi.mocked(useUploadMedia).mockReturnValue({ uploadFile: vi.fn() });
    const user = userEvent.setup();
    render(<UploadPageContent />);

    await user.upload(
      screen.getByLabelText('Choose files'),
      makeFile('report.pdf', 'application/pdf')
    );
    await waitFor(() => expect(screen.getByText('report.pdf')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /Remove/ }));

    expect(screen.queryByText('report.pdf')).not.toBeInTheDocument();
  });

  it('shows a "Done — go to library" action once every queued item finishes', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [], isError: false } as never);
    const uploadFile = vi.fn().mockResolvedValue(makeReadyMedia());
    vi.mocked(useUploadMedia).mockReturnValue({ uploadFile });
    const user = userEvent.setup();
    render(<UploadPageContent />);

    await user.upload(
      screen.getByLabelText('Choose files'),
      makeFile('report.pdf', 'application/pdf')
    );
    await waitFor(() => expect(screen.getByText('report.pdf')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Upload 1 file' }));

    const doneButton = await screen.findByRole('button', { name: 'Done — go to library' });
    await user.click(doneButton);
    expect(pushMock).toHaveBeenCalledWith('/media');
  });
});
