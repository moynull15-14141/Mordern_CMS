import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadDropzone } from './upload-dropzone';

function makeFile(name: string, type: string): File {
  return new File(['x'], name, { type });
}

describe('UploadDropzone', () => {
  it('calls onFilesSelected when a file is chosen via the hidden input', async () => {
    const onFilesSelected = vi.fn();
    const user = userEvent.setup();
    render(<UploadDropzone onFilesSelected={onFilesSelected} />);

    const file = makeFile('photo.jpg', 'image/jpeg');
    await user.upload(screen.getByLabelText('Choose files'), file);

    expect(onFilesSelected).toHaveBeenCalledWith([file]);
  });

  it('calls onFilesSelected with multiple files when several are chosen', async () => {
    const onFilesSelected = vi.fn();
    const user = userEvent.setup();
    render(<UploadDropzone onFilesSelected={onFilesSelected} />);

    const files = [makeFile('a.jpg', 'image/jpeg'), makeFile('b.png', 'image/png')];
    await user.upload(screen.getByLabelText('Choose files'), files);

    expect(onFilesSelected).toHaveBeenCalledWith(files);
  });

  it('calls onFilesSelected on drop', () => {
    const onFilesSelected = vi.fn();
    render(<UploadDropzone onFilesSelected={onFilesSelected} />);

    const file = makeFile('dropped.pdf', 'application/pdf');
    const dropzone = screen.getByRole('button');
    const dataTransfer = { files: [file] } as unknown as DataTransfer;

    dropzone.dispatchEvent(
      Object.assign(new Event('drop', { bubbles: true, cancelable: true }), { dataTransfer }),
    );

    expect(onFilesSelected).toHaveBeenCalledWith([file]);
  });

  it('does not open the file picker or accept drops while disabled', async () => {
    const onFilesSelected = vi.fn();
    render(<UploadDropzone onFilesSelected={onFilesSelected} disabled />);

    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });
});
