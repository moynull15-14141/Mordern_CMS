import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryFilters } from './category-filters';

describe('CategoryFilters', () => {
  it('renders a Status control', () => {
    render(<CategoryFilters value={{}} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  it('does not render "Clear filters" when nothing is active', () => {
    render(<CategoryFilters value={{}} onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
  });

  it('selecting a status calls onChange with that status', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<CategoryFilters value={{}} onChange={onChange} />);

    await user.click(screen.getByLabelText('Status'));
    await user.click(await screen.findByRole('option', { name: 'Inactive' }));

    expect(onChange).toHaveBeenCalledWith({ status: 'INACTIVE' });
  });

  it('shows "Clear filters" once active, and clears on click', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<CategoryFilters value={{ status: 'ACTIVE' }} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(onChange).toHaveBeenCalledWith({});
  });
});
