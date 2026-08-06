import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BooleanField } from './boolean-field';

describe('BooleanField', () => {
  it('reflects the current value', () => {
    render(
      <BooleanField
        descriptor={{ key: 'open', label: 'Open in new tab', kind: 'boolean' }}
        value={true}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('calls onChange when toggled', async () => {
    const onChange = vi.fn();
    render(
      <BooleanField
        descriptor={{ key: 'open', label: 'Open in new tab', kind: 'boolean' }}
        value={false}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
