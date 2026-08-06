import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumberField } from './number-field';

const descriptor = { key: 'height', label: 'Height', kind: 'number' as const };

/** A real controlled-input round-trip needs the harness to feed
 * `onChange` back into `value` (exactly what `PropertyPanel`/the store
 * do in the real app) — without it, the DOM input snaps back to the
 * fixed test-supplied `value` after every keystroke, which is a test
 * harness bug, not a `NumberField` one. */
function ControlledNumberField({
  onChange,
  initial = 0,
}: {
  onChange: (value: unknown) => void;
  initial?: number;
}) {
  const [value, setValue] = useState<unknown>(initial);
  return (
    <NumberField
      descriptor={descriptor}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

describe('NumberField', () => {
  it('renders the current numeric value', () => {
    render(<NumberField descriptor={descriptor} value={40} onChange={vi.fn()} />);
    expect(screen.getByRole('spinbutton')).toHaveValue(40);
  });

  it('calls onChange with a number when typed', async () => {
    const onChange = vi.fn();
    render(<ControlledNumberField onChange={onChange} />);
    await userEvent.clear(screen.getByRole('spinbutton'));
    await userEvent.type(screen.getByRole('spinbutton'), '80');
    expect(onChange).toHaveBeenLastCalledWith(80);
  });

  it('calls onChange with undefined when cleared', async () => {
    const onChange = vi.fn();
    render(<ControlledNumberField onChange={onChange} initial={40} />);
    await userEvent.clear(screen.getByRole('spinbutton'));
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });
});
