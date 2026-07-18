import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateCategoryForm, EditCategoryForm } from './category-form';
import { useCategoryFlat } from '../hooks/use-category-flat';

vi.mock('../hooks/use-category-flat', () => ({ useCategoryFlat: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('CreateCategoryForm', () => {
  it('renders the core fields', () => {
    vi.mocked(useCategoryFlat).mockReturnValue({ data: [], isError: false } as never);
    render(<CreateCategoryForm onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Slug')).toBeInTheDocument();
    expect(screen.getByLabelText('Parent category')).toBeInTheDocument();
  });

  it('does not render a Status field (CreateCategoryDto has none)', () => {
    vi.mocked(useCategoryFlat).mockReturnValue({ data: [], isError: false } as never);
    render(<CreateCategoryForm onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.queryByLabelText('Status')).not.toBeInTheDocument();
  });

  it('shows a validation error for an empty name and does not submit', async () => {
    vi.mocked(useCategoryFlat).mockReturnValue({ data: [], isError: false } as never);
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CreateCategoryForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.click(screen.getByRole('button', { name: 'Create category' }));

    await waitFor(() => expect(screen.getByText('Name is required.')).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits with the filled name', async () => {
    vi.mocked(useCategoryFlat).mockReturnValue({ data: [], isError: false } as never);
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CreateCategoryForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText('Name'), 'News');
    await user.click(screen.getByRole('button', { name: 'Create category' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'News' })));
  });
});

describe('EditCategoryForm', () => {
  const defaultValues = { name: 'News', status: 'ACTIVE' as const };

  it('renders a Status field (UpdateCategoryDto has one), no Parent field', () => {
    render(<EditCategoryForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.queryByLabelText('Parent category')).not.toBeInTheDocument();
  });

  it('disables submit until the form becomes dirty', () => {
    render(<EditCategoryForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('enables submit and calls onSubmit with the changed values once dirty', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<EditCategoryForm defaultValues={defaultValues} onSubmit={onSubmit} isSubmitting={false} />);

    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Sports');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Sports' })));
  });

  it('calls onDirtyChange as the form becomes dirty', async () => {
    const onDirtyChange = vi.fn();
    const user = userEvent.setup();
    render(
      <EditCategoryForm
        defaultValues={defaultValues}
        onSubmit={vi.fn()}
        isSubmitting={false}
        onDirtyChange={onDirtyChange}
      />,
    );

    expect(onDirtyChange).toHaveBeenCalledWith(false);
    await user.type(screen.getByLabelText('Name'), '!');
    await waitFor(() => expect(onDirtyChange).toHaveBeenCalledWith(true));
  });
});
