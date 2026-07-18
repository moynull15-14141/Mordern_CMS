import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditProfileForm } from './edit-profile-form';

const defaultValues = {
  firstName: 'Jane',
  lastName: 'Doe',
  bio: '',
  phone: '',
  website: '',
  city: '',
  country: '',
};

describe('EditProfileForm', () => {
  it('renders fields pre-filled from defaultValues', () => {
    render(<EditProfileForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByLabelText('First name')).toHaveValue('Jane');
    expect(screen.getByLabelText('Last name')).toHaveValue('Doe');
  });

  it('does not render email/username/displayName fields (no self-service endpoint for those)', () => {
    render(<EditProfileForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Username')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Display name')).not.toBeInTheDocument();
  });

  it('rejects an invalid website URL', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<EditProfileForm defaultValues={defaultValues} onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText('Website'), 'not-a-url');
    await user.click(screen.getByRole('button', { name: 'Save profile' }));

    await waitFor(() => expect(screen.getByText('Enter a valid URL.')).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the updated values', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<EditProfileForm defaultValues={defaultValues} onSubmit={onSubmit} isSubmitting={false} />);

    await user.clear(screen.getByLabelText('Bio'));
    await user.type(screen.getByLabelText('Bio'), 'Hello world');
    await user.click(screen.getByRole('button', { name: 'Save profile' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ bio: 'Hello world' })));
  });

  it('disables the submit button while isSubmitting is true', () => {
    render(<EditProfileForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting />);
    expect(screen.getByRole('button', { name: 'Save profile' })).toBeDisabled();
  });

  it('displays a submitError alert when given', () => {
    render(
      <EditProfileForm
        defaultValues={defaultValues}
        onSubmit={vi.fn()}
        isSubmitting={false}
        submitError="Something went wrong."
      />,
    );
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });
});
