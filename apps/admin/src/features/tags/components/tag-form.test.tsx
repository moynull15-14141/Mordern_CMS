import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateTagForm, EditTagForm } from './tag-form';

describe('CreateTagForm', () => {
  it('renders the core fields, no SEO or Status field', () => {
    render(<CreateTagForm onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Slug')).toBeInTheDocument();
    expect(screen.getByLabelText(/Synonyms/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/SEO/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Status')).not.toBeInTheDocument();
  });

  it('shows a validation error for an empty name and does not submit', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CreateTagForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.click(screen.getByRole('button', { name: 'Create tag' }));

    await waitFor(() => expect(screen.getByText('Name is required.')).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits with the filled name', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CreateTagForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText('Name'), 'Breaking');
    await user.click(screen.getByRole('button', { name: 'Create tag' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Breaking' })));
  });
});

describe('EditTagForm', () => {
  const defaultValues = { name: 'Breaking' };

  it('disables submit until the form becomes dirty', () => {
    render(<EditTagForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('enables submit and calls onSubmit once dirty', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<EditTagForm defaultValues={defaultValues} onSubmit={onSubmit} isSubmitting={false} />);

    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Urgent');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Urgent' })));
  });
});
