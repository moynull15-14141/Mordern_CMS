import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectField } from './select-field';

const descriptor = {
  key: 'style',
  label: 'Style',
  kind: 'select' as const,
  options: [
    { value: 'primary', label: 'Primary' },
    { value: 'secondary', label: 'Secondary' },
  ],
};

describe('SelectField', () => {
  it('shows the option list and calls onChange on selection', async () => {
    const onChange = vi.fn();
    render(<SelectField descriptor={descriptor} value="primary" onChange={onChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: 'Secondary' }));
    expect(onChange).toHaveBeenCalledWith('secondary');
  });
});
