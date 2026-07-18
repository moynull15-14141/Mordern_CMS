import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResetPasswordDialog } from './reset-password-dialog';

describe('ResetPasswordDialog', () => {
  it('renders the target user label in the title', () => {
    render(<ResetPasswordDialog open onOpenChange={vi.fn()} userLabel="Jane Doe" onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByText('Reset password for Jane Doe')).toBeInTheDocument();
  });

  it('warns that the target user will be logged out of every device', () => {
    render(<ResetPasswordDialog open onOpenChange={vi.fn()} userLabel="Jane Doe" onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByText('This will log the user out of every device.')).toBeInTheDocument();
  });

  it('does not render a current-password field (admin action, no ownership check)', () => {
    render(<ResetPasswordDialog open onOpenChange={vi.fn()} userLabel="Jane Doe" onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.queryByLabelText('Current password')).not.toBeInTheDocument();
  });

  it('rejects mismatched confirm password', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ResetPasswordDialog open onOpenChange={vi.fn()} userLabel="Jane Doe" onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText('New password'), 'New1!aaaa');
    await user.type(screen.getByLabelText('Confirm new password'), 'Different1!');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    await waitFor(() => expect(screen.getByText('Passwords do not match.')).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with only newPassword when valid', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ResetPasswordDialog open onOpenChange={vi.fn()} userLabel="Jane Doe" onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText('New password'), 'New1!aaaa');
    await user.type(screen.getByLabelText('Confirm new password'), 'New1!aaaa');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ newPassword: 'New1!aaaa' }));
  });
});
