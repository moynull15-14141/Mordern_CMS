import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditMetadataDialog } from './edit-metadata-dialog';

describe('EditMetadataDialog', () => {
  const defaultValues = { altText: 'A photo', caption: '', credit: '', status: 'READY' as const };

  it('pre-fills the form from defaultValues', () => {
    render(<EditMetadataDialog open onOpenChange={vi.fn()} defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByLabelText('Alt text')).toHaveValue('A photo');
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  it('submits the edited values', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<EditMetadataDialog open onOpenChange={vi.fn()} defaultValues={defaultValues} onSubmit={onSubmit} isSubmitting={false} />);

    await user.clear(screen.getByLabelText('Alt text'));
    await user.type(screen.getByLabelText('Alt text'), 'New alt text');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ altText: 'New alt text' })));
  });
});
