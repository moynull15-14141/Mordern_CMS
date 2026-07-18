import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreferencesForm } from './preferences-form';

const defaultValues = { theme: 'SYSTEM' as const, notificationPreference: { email: true, inApp: false } };

describe('PreferencesForm', () => {
  it('renders theme select and notification switches', () => {
    render(<PreferencesForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByLabelText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Email notifications')).toBeInTheDocument();
    expect(screen.getByText('In-app notifications')).toBeInTheDocument();
  });

  it('changing the theme selects the new value', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<PreferencesForm defaultValues={defaultValues} onSubmit={onSubmit} isSubmitting={false} />);

    await user.click(screen.getByLabelText('Theme'));
    await user.click(await screen.findByRole('option', { name: 'Dark' }));
    await user.click(screen.getByRole('button', { name: 'Save preferences' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ theme: 'DARK' }));
  });

  it('toggling a notification switch updates the submitted value', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<PreferencesForm defaultValues={defaultValues} onSubmit={onSubmit} isSubmitting={false} />);

    await user.click(screen.getAllByRole('switch')[0]!);
    await user.click(screen.getByRole('button', { name: 'Save preferences' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ notificationPreference: expect.objectContaining({ email: false }) }),
    );
  });

  it('disables the submit button while isSubmitting is true', () => {
    render(<PreferencesForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting />);
    expect(screen.getByRole('button', { name: 'Save preferences' })).toBeDisabled();
  });
});
