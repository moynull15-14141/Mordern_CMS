import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorInput } from './color-input';

describe('ColorInput', () => {
  it('renders a swatch and a text input', () => {
    render(<ColorInput value="#112233" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Pick color')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('#1a2b3c')).toBeInTheDocument();
  });

  it('reflects the current value in the text input', () => {
    render(<ColorInput value="#112233" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('#1a2b3c')).toHaveValue('#112233');
  });

  it('calls onChange when typing in the text input', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ColorInput value="" onChange={onChange} />);

    await user.type(screen.getByPlaceholderText('#1a2b3c'), '#');
    expect(onChange).toHaveBeenCalledWith('#');
  });

  it('falls back the swatch to black for an invalid/empty hex value', () => {
    render(<ColorInput value="" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Pick color')).toHaveValue('#000000');
  });

  it('uses the value directly as the swatch color when it is a valid 6-digit hex', () => {
    render(<ColorInput value="#a1b2c3" onChange={vi.fn()} />);
    expect(screen.getByLabelText('Pick color')).toHaveValue('#a1b2c3');
  });
});
