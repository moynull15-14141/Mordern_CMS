import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input', () => {
  it('renders and accepts typed text', async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Name" />);
    const input = screen.getByLabelText('Name');
    await user.type(input, 'Hello');
    expect(input).toHaveValue('Hello');
  });

  it('sets aria-invalid when invalid is true', () => {
    render(<Input aria-label="Email" invalid />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid by default', () => {
    render(<Input aria-label="Email" />);
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid');
  });

  it('forwards onChange', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Input aria-label="Name" onChange={onChange} />);
    await user.type(screen.getByLabelText('Name'), 'A');
    expect(onChange).toHaveBeenCalled();
  });

  it('respects the disabled attribute', () => {
    render(<Input aria-label="Name" disabled />);
    expect(screen.getByLabelText('Name')).toBeDisabled();
  });
});
