import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordForm } from './password-form';

describe('PasswordForm', () => {
  it('renders current, new, and confirm password fields', () => {
    render(<PasswordForm onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByLabelText('Current password')).toBeInTheDocument();
    expect(screen.getByLabelText('New password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm new password')).toBeInTheDocument();
  });

  it('warns that changing the password logs the user out of every device', () => {
    render(<PasswordForm onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByText('Changing your password will log you out of every device.')).toBeInTheDocument();
  });

  it('requires a current password', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<PasswordForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText('New password'), 'New1!aaaa');
    await user.type(screen.getByLabelText('Confirm new password'), 'New1!aaaa');
    await user.click(screen.getByRole('button', { name: 'Change password' }));

    await waitFor(() => expect(screen.getByText('Current password is required.')).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a new password that fails the policy regex', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<PasswordForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText('Current password'), 'old');
    await user.type(screen.getByLabelText('New password'), 'weak');
    await user.type(screen.getByLabelText('Confirm new password'), 'weak');
    await user.click(screen.getByRole('button', { name: 'Change password' }));

    await waitFor(() =>
      expect(
        screen.getByText(
          'At least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.',
        ),
      ).toBeInTheDocument(),
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects mismatched confirm password', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<PasswordForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText('Current password'), 'old');
    await user.type(screen.getByLabelText('New password'), 'New1!aaaa');
    await user.type(screen.getByLabelText('Confirm new password'), 'Different1!');
    await user.click(screen.getByRole('button', { name: 'Change password' }));

    await waitFor(() => expect(screen.getByText('Passwords do not match.')).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with only currentPassword/newPassword — confirmPassword is stripped', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<PasswordForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText('Current password'), 'old');
    await user.type(screen.getByLabelText('New password'), 'New1!aaaa');
    await user.type(screen.getByLabelText('Confirm new password'), 'New1!aaaa');
    await user.click(screen.getByRole('button', { name: 'Change password' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ currentPassword: 'old', newPassword: 'New1!aaaa' }),
    );
  });

  it('disables the submit button while isSubmitting is true', () => {
    render(<PasswordForm onSubmit={vi.fn()} isSubmitting />);
    expect(screen.getByRole('button', { name: 'Change password' })).toBeDisabled();
  });

  it('displays a submitError alert when given', () => {
    render(<PasswordForm onSubmit={vi.fn()} isSubmitting={false} submitError="Current password is incorrect." />);
    expect(screen.getByText('Current password is incorrect.')).toBeInTheDocument();
  });
});
