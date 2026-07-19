import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteDialog } from './delete-dialog';

describe('DeleteDialog', () => {
  it('renders the layout name in the confirmation description', () => {
    render(<DeleteDialog open onOpenChange={vi.fn()} layoutName="Default" onConfirm={vi.fn()} />);
    expect(screen.getByText('Delete "Default"?', { exact: false })).toBeInTheDocument();
  });

  it('calls onConfirm when the Delete button is clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<DeleteDialog open onOpenChange={vi.fn()} layoutName="Default" onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalled();
  });
});
