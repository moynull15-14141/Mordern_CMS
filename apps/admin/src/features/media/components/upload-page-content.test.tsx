import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadPageContent } from './upload-page-content';
import { useCreateMedia } from '../hooks/use-create-media';
import { useMediaFolderTree } from '../hooks/use-media-folder-tree';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: pushMock }) }));
vi.mock('../hooks/use-create-media', () => ({ useCreateMedia: vi.fn() }));
vi.mock('../hooks/use-media-folder-tree', () => ({ useMediaFolderTree: vi.fn() }));

function makeFile(name: string, type: string): File {
  return new File(['x'], name, { type });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('UploadPageContent', () => {
  it('queues a selected file and extracts its metadata', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [], isError: false } as never);
    vi.mocked(useCreateMedia).mockReturnValue({ mutateAsync: vi.fn() } as never);
    const user = userEvent.setup();
    render(<UploadPageContent />);

    await user.upload(screen.getByLabelText('Choose files'), makeFile('report.pdf', 'application/pdf'));

    await waitFor(() => expect(screen.getByText('report.pdf')).toBeInTheDocument());
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('shows a validation error and does not call the API when storageKey is left blank', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [], isError: false } as never);
    const mutateAsync = vi.fn();
    vi.mocked(useCreateMedia).mockReturnValue({ mutateAsync } as never);
    const user = userEvent.setup();
    render(<UploadPageContent />);

    await user.upload(screen.getByLabelText('Choose files'), makeFile('report.pdf', 'application/pdf'));
    await waitFor(() => expect(screen.getByText('report.pdf')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Register 1 file' }));

    await waitFor(() => expect(screen.getByText('Storage key is required.')).toBeInTheDocument());
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('registers a file once storageKey is filled, and shows Registered on success', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [], isError: false } as never);
    const mutateAsync = vi.fn().mockResolvedValue({ id: 'm1' });
    vi.mocked(useCreateMedia).mockReturnValue({ mutateAsync } as never);
    const user = userEvent.setup();
    render(<UploadPageContent />);

    await user.upload(screen.getByLabelText('Choose files'), makeFile('report.pdf', 'application/pdf'));
    await waitFor(() => expect(screen.getByText('report.pdf')).toBeInTheDocument());
    await user.type(screen.getByLabelText('Storage key'), 'uploads/report.pdf');
    await user.click(screen.getByRole('button', { name: 'Register 1 file' }));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    expect(mutateAsync.mock.calls[0][0].input).toMatchObject({
      storageKey: 'uploads/report.pdf',
      filename: 'report.pdf',
      type: 'DOCUMENT',
    });
    await waitFor(() => expect(screen.getByText('Registered')).toBeInTheDocument());
  });

  it('shows an error and a Retry button when registration fails', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [], isError: false } as never);
    const mutateAsync = vi.fn().mockRejectedValue(new Error('Server error'));
    vi.mocked(useCreateMedia).mockReturnValue({ mutateAsync } as never);
    const user = userEvent.setup();
    render(<UploadPageContent />);

    await user.upload(screen.getByLabelText('Choose files'), makeFile('report.pdf', 'application/pdf'));
    await waitFor(() => expect(screen.getByText('report.pdf')).toBeInTheDocument());
    await user.type(screen.getByLabelText('Storage key'), 'uploads/report.pdf');
    await user.click(screen.getByRole('button', { name: 'Register 1 file' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument());
  });

  it('removes a queued item from the list', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [], isError: false } as never);
    vi.mocked(useCreateMedia).mockReturnValue({ mutateAsync: vi.fn() } as never);
    const user = userEvent.setup();
    render(<UploadPageContent />);

    await user.upload(screen.getByLabelText('Choose files'), makeFile('report.pdf', 'application/pdf'));
    await waitFor(() => expect(screen.getByText('report.pdf')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /Remove/ }));

    expect(screen.queryByText('report.pdf')).not.toBeInTheDocument();
  });

  it('shows a "Done — go to library" action once every queued item succeeds', async () => {
    vi.mocked(useMediaFolderTree).mockReturnValue({ data: [], isError: false } as never);
    const mutateAsync = vi.fn().mockResolvedValue({ id: 'm1' });
    vi.mocked(useCreateMedia).mockReturnValue({ mutateAsync } as never);
    const user = userEvent.setup();
    render(<UploadPageContent />);

    await user.upload(screen.getByLabelText('Choose files'), makeFile('report.pdf', 'application/pdf'));
    await waitFor(() => expect(screen.getByText('report.pdf')).toBeInTheDocument());
    await user.type(screen.getByLabelText('Storage key'), 'uploads/report.pdf');
    await user.click(screen.getByRole('button', { name: 'Register 1 file' }));

    const doneButton = await screen.findByRole('button', { name: 'Done — go to library' });
    await user.click(doneButton);
    expect(pushMock).toHaveBeenCalledWith('/media');
  });
});
