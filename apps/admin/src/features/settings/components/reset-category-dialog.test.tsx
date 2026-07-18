import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResetCategoryDialog } from './reset-category-dialog';

describe('ResetCategoryDialog', () => {
  it('renders the category label in the confirmation description', () => {
    render(<ResetCategoryDialog open onOpenChange={vi.fn()} category="seo" onConfirm={vi.fn()} />);
    expect(screen.getByText(/Reset every setting in "SEO"/)).toBeInTheDocument();
  });

  it('calls onConfirm when the Reset category button is clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<ResetCategoryDialog open onOpenChange={vi.fn()} category="seo" onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: 'Reset category' }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('does not render when closed', () => {
    render(<ResetCategoryDialog open={false} onOpenChange={vi.fn()} category="seo" onConfirm={vi.fn()} />);
    expect(screen.queryByText(/Reset every setting/)).not.toBeInTheDocument();
  });
});
