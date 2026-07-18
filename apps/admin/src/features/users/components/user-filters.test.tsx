import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserFilters } from './user-filters';

describe('UserFilters', () => {
  it('renders Status, Role, and date-range controls', () => {
    render(<UserFilters value={{}} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
    expect(screen.getByLabelText('Created from')).toBeInTheDocument();
    expect(screen.getByLabelText('Created to')).toBeInTheDocument();
  });

  it('does not render a "Clear filters" button when nothing is active', () => {
    render(<UserFilters value={{}} onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
  });

  it('shows "Clear filters" once a filter is active, and clears on click', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<UserFilters value={{ status: 'ACTIVE' }} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(onChange).toHaveBeenCalledWith({});
  });

  it('selecting a status calls onChange with that status', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<UserFilters value={{}} onChange={onChange} />);

    await user.click(screen.getByLabelText('Status'));
    await user.click(await screen.findByRole('option', { name: 'Active' }));

    expect(onChange).toHaveBeenCalledWith({ status: 'ACTIVE' });
  });

  it('selecting "All statuses" clears the status filter', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<UserFilters value={{ status: 'ACTIVE' }} onChange={onChange} />);

    await user.click(screen.getByLabelText('Status'));
    await user.click(await screen.findByRole('option', { name: 'All statuses' }));

    expect(onChange).toHaveBeenCalledWith({ status: undefined });
  });

  it('selecting a role calls onChange with that role name', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<UserFilters value={{}} onChange={onChange} />);

    await user.click(screen.getByLabelText('Role'));
    await user.click(await screen.findByRole('option', { name: 'Editor' }));

    expect(onChange).toHaveBeenCalledWith({ role: 'Editor' });
  });

  it('lists all 11 frozen system roles as options', async () => {
    const user = userEvent.setup();
    render(<UserFilters value={{}} onChange={vi.fn()} />);

    await user.click(screen.getByLabelText('Role'));
    expect(await screen.findByRole('option', { name: 'Super Admin' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Guest' })).toBeInTheDocument();
  });

  it('typing a created-from date calls onChange with the ISO date string', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<UserFilters value={{}} onChange={onChange} />);

    await user.type(screen.getByLabelText('Created from'), '2026-01-15');
    expect(onChange).toHaveBeenLastCalledWith({ createdFrom: '2026-01-15' });
  });

  it('typing a created-to date calls onChange with the ISO date string', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<UserFilters value={{}} onChange={onChange} />);

    await user.type(screen.getByLabelText('Created to'), '2026-02-01');
    expect(onChange).toHaveBeenLastCalledWith({ createdTo: '2026-02-01' });
  });

  it('preserves other active filters when changing one field', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<UserFilters value={{ status: 'ACTIVE', role: 'Editor' }} onChange={onChange} />);

    await user.click(screen.getByLabelText('Role'));
    await user.click(await screen.findByRole('option', { name: 'Author' }));

    expect(onChange).toHaveBeenCalledWith({ status: 'ACTIVE', role: 'Author' });
  });
});
