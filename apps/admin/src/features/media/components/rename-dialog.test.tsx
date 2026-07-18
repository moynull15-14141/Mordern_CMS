import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RenameDialog } from './rename-dialog';

describe('RenameDialog', () => {
  it('pre-fills the filename field', () => {
    render(<RenameDialog open onOpenChange={vi.fn()} currentFilename="photo.jpg" onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByLabelText('Filename')).toHaveValue('photo.jpg');
  });

  it('submits the new filename', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<RenameDialog open onOpenChange={vi.fn()} currentFilename="photo.jpg" onSubmit={onSubmit} isSubmitting={false} />);

    await user.clear(screen.getByLabelText('Filename'));
    await user.type(screen.getByLabelText('Filename'), 'new-name.jpg');
    await user.click(screen.getByRole('button', { name: 'Rename' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ filename: 'new-name.jpg' }));
  });

  it('rejects an empty filename', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<RenameDialog open onOpenChange={vi.fn()} currentFilename="photo.jpg" onSubmit={onSubmit} isSubmitting={false} />);

    await user.clear(screen.getByLabelText('Filename'));
    await user.click(screen.getByRole('button', { name: 'Rename' }));

    await waitFor(() => expect(screen.getByText('Filename is required.')).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
