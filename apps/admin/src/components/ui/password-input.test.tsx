import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordInput } from './password-input';

describe('PasswordInput', () => {
  it('renders as a password field by default', () => {
    render(<PasswordInput aria-label="Password" />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('reveals the value as plain text after clicking "Show password"', async () => {
    const user = userEvent.setup();
    render(<PasswordInput aria-label="Password" />);

    await user.click(screen.getByRole('button', { name: 'Show password' }));

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
  });

  it('hides the value again after clicking "Hide password"', async () => {
    const user = userEvent.setup();
    render(<PasswordInput aria-label="Password" />);

    await user.click(screen.getByRole('button', { name: 'Show password' }));
    await user.click(screen.getByRole('button', { name: 'Hide password' }));

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('sets aria-pressed to reflect the toggle state', async () => {
    const user = userEvent.setup();
    render(<PasswordInput aria-label="Password" />);

    const toggle = screen.getByRole('button', { name: 'Show password' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('accepts typed input regardless of visibility state', async () => {
    const user = userEvent.setup();
    render(<PasswordInput aria-label="Password" />);

    await user.type(screen.getByLabelText('Password'), 'hunter2');
    expect(screen.getByLabelText('Password')).toHaveValue('hunter2');
  });
});
