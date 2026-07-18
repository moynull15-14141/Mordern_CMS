import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RestoreDialog } from './restore-dialog';

describe('RestoreDialog', () => {
  it('renders the user label in the confirmation description', () => {
    render(<RestoreDialog open onOpenChange={vi.fn()} userLabel="Jane Doe" onConfirm={vi.fn()} />);
    expect(screen.getByText('Restore "Jane Doe"?')).toBeInTheDocument();
  });

  it('calls onConfirm when the Restore button is clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<RestoreDialog open onOpenChange={vi.fn()} userLabel="Jane Doe" onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: 'Restore' }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('does not render when closed', () => {
    render(<RestoreDialog open={false} onOpenChange={vi.fn()} userLabel="Jane Doe" onConfirm={vi.fn()} />);
    expect(screen.queryByText('Restore "Jane Doe"?')).not.toBeInTheDocument();
  });
});
