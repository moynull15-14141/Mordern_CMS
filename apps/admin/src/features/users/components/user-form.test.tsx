import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateUserForm, EditUserForm } from './user-form';

describe('CreateUserForm', () => {
  it('renders email, username, display name, and password fields', () => {
    render(<CreateUserForm onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Display name')).toBeInTheDocument();
    expect(screen.getByLabelText('Password (optional)')).toBeInTheDocument();
  });

  it('does not render a status or role field (no backend field exists)', () => {
    render(<CreateUserForm onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.queryByLabelText(/status/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/role/i)).not.toBeInTheDocument();
  });

  it('shows a validation error for an invalid email and does not submit', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CreateUserForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Create user' }));

    await waitFor(() => expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a password that fails the policy regex', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CreateUserForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText('Email'), 'a@b.com');
    await user.type(screen.getByLabelText('Password (optional)'), 'weak');
    await user.click(screen.getByRole('button', { name: 'Create user' }));

    await waitFor(() =>
      expect(
        screen.getByText(
          'At least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.',
        ),
      ).toBeInTheDocument(),
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits with only email when username/displayName/password are left blank', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CreateUserForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText('Email'), 'a@b.com');
    await user.click(screen.getByRole('button', { name: 'Create user' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.com', username: '', displayName: '', password: '' }),
    );
  });

  it('submits a valid password matching the policy', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CreateUserForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText('Email'), 'a@b.com');
    await user.type(screen.getByLabelText('Password (optional)'), 'Strong1!aaaa');
    await user.click(screen.getByRole('button', { name: 'Create user' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'a@b.com', password: 'Strong1!aaaa' }),
      ),
    );
  });

  it('disables the submit button while isSubmitting is true', () => {
    render(<CreateUserForm onSubmit={vi.fn()} isSubmitting />);
    expect(screen.getByRole('button', { name: 'Create user' })).toBeDisabled();
  });

  it('displays a submitError alert when given', () => {
    render(<CreateUserForm onSubmit={vi.fn()} isSubmitting={false} submitError="This email is already taken." />);
    expect(screen.getByText('This email is already taken.')).toBeInTheDocument();
  });
});

describe('EditUserForm', () => {
  const defaultValues = { username: 'jdoe', displayName: 'Jane Doe' };

  it('renders username and display name pre-filled from defaultValues', () => {
    render(<EditUserForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByLabelText('Username')).toHaveValue('jdoe');
    expect(screen.getByLabelText('Display name')).toHaveValue('Jane Doe');
  });

  it('does not render email/password/status/role fields (not editable via UpdateUserDto)', () => {
    render(<EditUserForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/status/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/role/i)).not.toBeInTheDocument();
  });

  it('disables submit until the form becomes dirty', () => {
    render(<EditUserForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('enables submit and calls onSubmit with the changed values once dirty', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<EditUserForm defaultValues={defaultValues} onSubmit={onSubmit} isSubmitting={false} />);

    await user.clear(screen.getByLabelText('Display name'));
    await user.type(screen.getByLabelText('Display name'), 'Jane Smith');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ username: 'jdoe', displayName: 'Jane Smith' }),
    );
  });

  it('calls onDirtyChange as the form becomes dirty', async () => {
    const onDirtyChange = vi.fn();
    const user = userEvent.setup();
    render(
      <EditUserForm
        defaultValues={defaultValues}
        onSubmit={vi.fn()}
        isSubmitting={false}
        onDirtyChange={onDirtyChange}
      />,
    );

    expect(onDirtyChange).toHaveBeenCalledWith(false);
    await user.type(screen.getByLabelText('Display name'), '!');
    await waitFor(() => expect(onDirtyChange).toHaveBeenCalledWith(true));
  });

  it('disables the submit button while isSubmitting is true, even if dirty', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <EditUserForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting={false} />,
    );
    await user.type(screen.getByLabelText('Display name'), '!');
    rerender(<EditUserForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting />);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });
});
