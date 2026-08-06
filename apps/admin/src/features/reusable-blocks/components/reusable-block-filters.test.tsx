import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReusableBlockFilters } from './reusable-block-filters';

describe('ReusableBlockFilters', () => {
  it('renders a Block type control', () => {
    render(<ReusableBlockFilters value={{}} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Block type')).toBeInTheDocument();
  });

  it('does not render a "Clear filters" button when nothing is active', () => {
    render(<ReusableBlockFilters value={{}} onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
  });

  it('shows "Clear filters" once a filter is active, and clears on click', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ReusableBlockFilters value={{ blockType: 'paragraph' }} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(onChange).toHaveBeenCalledWith({});
  });

  it('selecting a block type calls onChange with that type', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ReusableBlockFilters value={{}} onChange={onChange} />);

    await user.click(screen.getByLabelText('Block type'));
    await user.click(await screen.findByRole('option', { name: 'Paragraph' }));

    expect(onChange).toHaveBeenCalledWith({ blockType: 'paragraph' });
  });
});
