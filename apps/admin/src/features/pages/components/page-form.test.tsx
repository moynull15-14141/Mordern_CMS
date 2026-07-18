import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreatePageForm, EditPageForm } from './page-form';

describe('CreatePageForm', () => {
  it('renders the core fields', () => {
    render(<CreatePageForm onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Slug')).toBeInTheDocument();
    expect(screen.getByLabelText(/Content/)).toBeInTheDocument();
  });

  it('does not render a status field (CreatePageDto has none)', () => {
    render(<CreatePageForm onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.queryByLabelText('Status')).not.toBeInTheDocument();
  });

  it('shows a validation error for an empty title and does not submit', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CreatePageForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText(/Content/), 'body text');
    await user.click(screen.getByRole('button', { name: 'Create page' }));

    await waitFor(() => expect(screen.getByText('Title is required.')).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits with the filled values', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CreatePageForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText('Title'), 'About Us');
    await user.type(screen.getByLabelText(/Content/), 'Some body text');
    await user.click(screen.getByRole('button', { name: 'Create page' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'About Us', bodyText: 'Some body text' })
      )
    );
  });
});

describe('EditPageForm', () => {
  const defaultValues = {
    title: 'About Us',
    slug: 'about-us',
    bodyText: 'Some body text',
    status: 'DRAFT' as const,
  };

  it('renders a Status field (UpdatePageDto has one)', () => {
    render(<EditPageForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  it('disables submit until the form becomes dirty', () => {
    render(<EditPageForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('enables submit and calls onSubmit with the changed values once dirty', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<EditPageForm defaultValues={defaultValues} onSubmit={onSubmit} isSubmitting={false} />);

    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'New Title');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Title' }))
    );
  });

  it('calls onDirtyChange as the form becomes dirty', async () => {
    const onDirtyChange = vi.fn();
    const user = userEvent.setup();
    render(
      <EditPageForm
        defaultValues={defaultValues}
        onSubmit={vi.fn()}
        isSubmitting={false}
        onDirtyChange={onDirtyChange}
      />
    );

    expect(onDirtyChange).toHaveBeenCalledWith(false);
    await user.type(screen.getByLabelText('Title'), '!');
    await waitFor(() => expect(onDirtyChange).toHaveBeenCalledWith(true));
  });
});
