import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateThemeForm, EditThemeForm } from './theme-form';

describe('CreateThemeForm', () => {
  it('renders the core fields', () => {
    render(<CreateThemeForm onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Slug')).toBeInTheDocument();
    expect(screen.getByLabelText('Version')).toBeInTheDocument();
  });

  it('does not render a status field (CreateThemeDto has none)', () => {
    render(<CreateThemeForm onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.queryByLabelText('Status')).not.toBeInTheDocument();
  });

  it('renders the appearance settings fields', () => {
    render(<CreateThemeForm onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByLabelText('Logo URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Primary Color')).toBeInTheDocument();
    expect(screen.getByLabelText('Custom CSS')).toBeInTheDocument();
  });

  it('renders the live preview', () => {
    render(<CreateThemeForm onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
  });

  it('shows a validation error for an empty name and does not submit', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CreateThemeForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.click(screen.getByRole('button', { name: 'Create theme' }));

    await waitFor(() => expect(screen.getByText('Name is required.')).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits with the filled values', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CreateThemeForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText('Name'), 'Classic');
    await user.click(screen.getByRole('button', { name: 'Create theme' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Classic' }))
    );
  });

  it('updates the live preview header text as headerLayout is typed', async () => {
    const user = userEvent.setup();
    render(<CreateThemeForm onSubmit={vi.fn()} isSubmitting={false} />);

    await user.type(screen.getByLabelText('Header Layout'), 'Centered Nav');

    await waitFor(() =>
      expect(screen.getByTestId('theme-preview-header')).toHaveTextContent('Centered Nav')
    );
  });
});

describe('EditThemeForm', () => {
  const defaultValues = {
    name: 'Classic',
    slug: 'classic',
    version: '',
    author: '',
    description: '',
    thumbnail: '',
    status: 'DRAFT' as const,
    settings: {
      logo: '',
      favicon: '',
      primaryColor: '',
      secondaryColor: '',
      typographyText: '',
      headerLayout: '',
      footerLayout: '',
      containerWidth: '',
      borderRadius: '',
      buttonStyle: '',
      homepageLayout: '',
      blogLayout: '',
      customCss: '',
      customJs: '',
    },
  };

  it('renders a Status field (UpdateThemeDto has one)', () => {
    render(<EditThemeForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  it('disables submit until the form becomes dirty', () => {
    render(<EditThemeForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('enables submit and calls onSubmit with the changed values once dirty', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <EditThemeForm defaultValues={defaultValues} onSubmit={onSubmit} isSubmitting={false} />
    );

    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'New Name');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Name' }))
    );
  });

  it('calls onDirtyChange as the form becomes dirty', async () => {
    const onDirtyChange = vi.fn();
    const user = userEvent.setup();
    render(
      <EditThemeForm
        defaultValues={defaultValues}
        onSubmit={vi.fn()}
        isSubmitting={false}
        onDirtyChange={onDirtyChange}
      />
    );

    expect(onDirtyChange).toHaveBeenCalledWith(false);
    await user.type(screen.getByLabelText('Name'), '!');
    await waitFor(() => expect(onDirtyChange).toHaveBeenCalledWith(true));
  });
});
