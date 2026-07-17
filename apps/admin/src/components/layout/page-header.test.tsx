import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from './page-header';

describe('PageHeader', () => {
  it('renders the title as a heading', () => {
    render(<PageHeader title="Articles" />);
    expect(screen.getByRole('heading', { name: 'Articles' })).toBeInTheDocument();
  });

  it('renders an optional description', () => {
    render(<PageHeader title="Articles" description="Manage your content." />);
    expect(screen.getByText('Manage your content.')).toBeInTheDocument();
  });

  it('omits the description when none is given', () => {
    render(<PageHeader title="Articles" />);
    expect(screen.queryByText('Manage your content.')).not.toBeInTheDocument();
  });

  it('renders provided actions', () => {
    render(<PageHeader title="Articles" actions={<button>New Article</button>} />);
    expect(screen.getByRole('button', { name: 'New Article' })).toBeInTheDocument();
  });
});
