import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteDialog } from './delete-dialog';
import { useReusableBlockUsages } from '../hooks/use-reusable-block-usages';
import type { ReusableBlock } from '../types/reusable-block';

vi.mock('../hooks/use-reusable-block-usages', () => ({ useReusableBlockUsages: vi.fn() }));

const block: ReusableBlock = {
  id: 'rb-1',
  name: 'Newsletter callout',
  description: null,
  category: null,
  blockType: 'callout',
  data: {},
  children: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
};

describe('DeleteDialog', () => {
  it('disables the Delete button while usages are being fetched, to avoid an accidental delete before the check completes', () => {
    vi.mocked(useReusableBlockUsages).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as never);
    render(<DeleteDialog open onOpenChange={vi.fn()} block={block} onConfirm={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it('confirmable state: renders the confirmation and calls onConfirm when clicked', async () => {
    vi.mocked(useReusableBlockUsages).mockReturnValue({ data: [], isLoading: false } as never);
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<DeleteDialog open onOpenChange={vi.fn()} block={block} onConfirm={onConfirm} />);

    expect(screen.getByText('Delete "Newsletter callout"?', { exact: false })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('blocked state: shows usages, hides the Delete button, and lets the user navigate away', () => {
    vi.mocked(useReusableBlockUsages).mockReturnValue({
      data: [{ contentType: 'page', id: 'p1', title: 'About', slug: 'about' }],
      isLoading: false,
    } as never);
    render(<DeleteDialog open onOpenChange={vi.fn()} block={block} onConfirm={vi.fn()} />);

    expect(screen.getByText(/still used in 1 place/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /About/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
});
