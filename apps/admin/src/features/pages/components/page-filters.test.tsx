import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageFilters } from './page-filters';

describe('PageFilters', () => {
  it('renders a Status control', () => {
    render(<PageFilters value={{}} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  it('does not render a "Clear filters" button when nothing is active', () => {
    render(<PageFilters value={{}} onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
  });

  it('shows "Clear filters" once a filter is active, and clears on click', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<PageFilters value={{ status: 'DRAFT' }} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(onChange).toHaveBeenCalledWith({});
  });

  it('selecting a status calls onChange with that status', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<PageFilters value={{}} onChange={onChange} />);

    await user.click(screen.getByLabelText('Status'));
    await user.click(await screen.findByRole('option', { name: 'Published' }));

    expect(onChange).toHaveBeenCalledWith({ status: 'PUBLISHED' });
  });
});
