import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextField } from './text-field';

describe('TextField', () => {
  it('renders the current value and calls onChange on input', async () => {
    const onChange = vi.fn();
    render(
      <TextField
        descriptor={{ key: 'label', label: 'Label', kind: 'text' }}
        value="Hi"
        onChange={onChange}
      />
    );
    const input = screen.getByDisplayValue('Hi');
    await userEvent.type(input, '!');
    expect(onChange).toHaveBeenCalled();
  });

  it('treats a non-string value as empty', () => {
    render(
      <TextField
        descriptor={{ key: 'label', label: 'Label', kind: 'text' }}
        value={42}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByRole('textbox')).toHaveValue('');
  });
});
