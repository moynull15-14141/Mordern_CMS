import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from './search-input';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('SearchInput', () => {
  it('renders the given value', () => {
    render(<SearchInput value="hello" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveValue('hello');
  });

  it('calls onChange after the debounce delay once typing stops', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SearchInput value="" onChange={onChange} debounceMs={300} />);

    await user.type(screen.getByRole('textbox'), 'cat');
    expect(onChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(onChange).toHaveBeenCalledWith('cat');
  });

  it('shows a clear button once there is text, and clears it on click', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SearchInput value="" onChange={onChange} />);

    await user.type(screen.getByRole('textbox'), 'x');
    expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('re-syncs its internal value when the external value prop changes', () => {
    const { rerender } = render(<SearchInput value="first" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveValue('first');

    rerender(<SearchInput value="second" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveValue('second');
  });
});
