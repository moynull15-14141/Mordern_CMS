import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArticleTable } from './article-table';
import type { Article } from '../types/article';

function makeArticle(overrides: Partial<Article> = {}): Article {
  return {
    id: 'a1',
    title: 'Hello World',
    subtitle: null,
    slug: 'hello-world',
    summary: null,
    body: { text: 'x' },
    status: 'DRAFT',
    publishedAt: null,
    scheduledAt: null,
    visibility: 'PUBLIC',
    language: 'en',
    locale: 'en-US',
    canonicalUrl: null,
    readingTime: null,
    wordCount: null,
    notes: null,
    featuredMediaId: null,
    author: { id: 'au1', penName: 'Jane Author', userId: null },
    category: { id: 'c1', name: 'News', slug: 'news' },
    tags: [],
    seo: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    deletedAt: null,
    ...overrides,
  };
}

const baseProps = {
  data: [makeArticle()],
  onPageChange: vi.fn(),
  onLimitChange: vi.fn(),
  sorting: [],
  onSortingChange: vi.fn(),
  search: '',
  onSearchChange: vi.fn(),
  onView: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onRestore: vi.fn(),
};

describe('ArticleTable', () => {
  it('renders title, slug, status, category, and author', () => {
    render(<ArticleTable {...baseProps} />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('hello-world')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('News')).toBeInTheDocument();
    expect(screen.getByText('Jane Author')).toBeInTheDocument();
  });

  it('shows Edit/Delete actions for a non-deleted article and calls the right callback', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<ArticleTable {...baseProps} onEdit={onEdit} />);

    await user.click(screen.getByRole('button', { name: 'Actions for Hello World' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));

    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'a1' }));
  });

  it('shows Restore instead of Edit/Delete for a soft-deleted article', async () => {
    const onRestore = vi.fn();
    const user = userEvent.setup();
    const deleted = makeArticle({ deletedAt: '2026-01-03T00:00:00.000Z' });
    render(<ArticleTable {...baseProps} data={[deleted]} onRestore={onRestore} />);

    await user.click(screen.getByRole('button', { name: 'Actions for Hello World' }));
    expect(screen.getByRole('menuitem', { name: 'Restore' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Edit' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Restore' }));
    expect(onRestore).toHaveBeenCalledWith(expect.objectContaining({ id: 'a1' }));
  });

  it('renders the empty state when there are no articles', () => {
    render(<ArticleTable {...baseProps} data={[]} />);
    expect(screen.getByText('No articles yet')).toBeInTheDocument();
  });
});
