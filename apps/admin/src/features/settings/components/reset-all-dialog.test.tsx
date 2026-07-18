import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResetAllDialog } from './reset-all-dialog';

describe('ResetAllDialog', () => {
  it('renders the confirmation description', () => {
    render(<ResetAllDialog open onOpenChange={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByText(/Reset every setting across every category/)).toBeInTheDocument();
  });

  it('calls onConfirm when the Reset all settings button is clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<ResetAllDialog open onOpenChange={vi.fn()} onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: 'Reset all settings' }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('does not render when closed', () => {
    render(<ResetAllDialog open={false} onOpenChange={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.queryByText(/Reset every setting/)).not.toBeInTheDocument();
  });
});
