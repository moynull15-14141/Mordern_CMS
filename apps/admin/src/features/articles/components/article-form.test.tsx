import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateArticleForm, EditArticleForm } from './article-form';
import { useCategoryOptions } from '../hooks/use-category-options';
import { useTagOptions } from '../hooks/use-tag-options';
import { useMediaList } from '@/features/media/hooks/use-media-list';

vi.mock('../hooks/use-category-options', () => ({ useCategoryOptions: vi.fn() }));
vi.mock('../hooks/use-tag-options', () => ({ useTagOptions: vi.fn() }));
// `FeaturedImageField` now reuses the shared `MediaPickerDialog`
// (`@/features/media`, Frontend Milestone 7), which calls `useMediaList`
// internally — mocked here rather than the deleted Milestone 5
// `use-media-options` hook.
vi.mock('@/features/media/hooks/use-media-list', () => ({ useMediaList: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

function mockSelectors() {
  vi.mocked(useCategoryOptions).mockReturnValue({ data: [], isError: false } as never);
  vi.mocked(useTagOptions).mockReturnValue({ data: { data: [], meta: {} }, isError: false } as never);
  vi.mocked(useMediaList).mockReturnValue({ data: { data: [], meta: {} }, isLoading: false, isError: false } as never);
}

describe('CreateArticleForm', () => {
  it('renders the core fields', () => {
    mockSelectors();
    render(<CreateArticleForm onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText(/Content/)).toBeInTheDocument();
    expect(screen.getByLabelText('Author id (UUID)')).toBeInTheDocument();
    expect(screen.getByLabelText('Language')).toBeInTheDocument();
    expect(screen.getByLabelText('Locale')).toBeInTheDocument();
  });

  it('does not render a status field (CreateArticleDto has none)', () => {
    mockSelectors();
    render(<CreateArticleForm onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.queryByLabelText('Status')).not.toBeInTheDocument();
  });

  it('shows a validation error for an empty title and does not submit', async () => {
    mockSelectors();
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CreateArticleForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText('Author id (UUID)'), '11111111-1111-1111-1111-111111111111');
    await user.type(screen.getByLabelText(/Content/), 'body text');
    await user.click(screen.getByRole('button', { name: 'Create article' }));

    await waitFor(() => expect(screen.getByText('Title is required.')).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a non-UUID author id', async () => {
    mockSelectors();
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CreateArticleForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText('Title'), 'Hello');
    await user.type(screen.getByLabelText(/Content/), 'body text');
    await user.type(screen.getByLabelText('Author id (UUID)'), 'not-a-uuid');
    await user.click(screen.getByRole('button', { name: 'Create article' }));

    await waitFor(() => expect(screen.getByText('Must be a valid Author id (UUID).')).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits with the filled values', async () => {
    mockSelectors();
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CreateArticleForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByLabelText('Title'), 'Hello World');
    await user.type(screen.getByLabelText(/Content/), 'Some body text');
    await user.type(screen.getByLabelText('Author id (UUID)'), '11111111-1111-1111-1111-111111111111');
    await user.click(screen.getByRole('button', { name: 'Create article' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Hello World',
          bodyText: 'Some body text',
          authorId: '11111111-1111-1111-1111-111111111111',
        }),
      ),
    );
  });
});

describe('EditArticleForm', () => {
  const defaultValues = {
    title: 'Hello World',
    bodyText: 'Some body text',
    status: 'DRAFT' as const,
  };

  it('renders a Status field (UpdateArticleDto has one)', () => {
    mockSelectors();
    render(<EditArticleForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
  });

  it('does not render authorId/language/locale fields (not editable via UpdateArticleDto)', () => {
    mockSelectors();
    render(<EditArticleForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.queryByLabelText('Author id (UUID)')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Language')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Locale')).not.toBeInTheDocument();
  });

  it('disables submit until the form becomes dirty', () => {
    mockSelectors();
    render(<EditArticleForm defaultValues={defaultValues} onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  });

  it('enables submit and calls onSubmit with the changed values once dirty', async () => {
    mockSelectors();
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<EditArticleForm defaultValues={defaultValues} onSubmit={onSubmit} isSubmitting={false} />);

    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'New Title');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Title' })));
  });

  it('calls onDirtyChange as the form becomes dirty', async () => {
    mockSelectors();
    const onDirtyChange = vi.fn();
    const user = userEvent.setup();
    render(
      <EditArticleForm
        defaultValues={defaultValues}
        onSubmit={vi.fn()}
        isSubmitting={false}
        onDirtyChange={onDirtyChange}
      />,
    );

    expect(onDirtyChange).toHaveBeenCalledWith(false);
    await user.type(screen.getByLabelText('Title'), '!');
    await waitFor(() => expect(onDirtyChange).toHaveBeenCalledWith(true));
  });
});
