import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DuplicateDialog } from './duplicate-dialog';
import type { ReusableBlock } from '../types/reusable-block';

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

describe('DuplicateDialog', () => {
  it('pre-fills the name field with "<original> (copy)"', () => {
    render(
      <DuplicateDialog
        open
        onOpenChange={vi.fn()}
        block={block}
        onSubmit={vi.fn()}
        isSubmitting={false}
      />
    );
    expect(screen.getByLabelText('Name')).toHaveValue('Newsletter callout (copy)');
  });

  it('submits the (possibly edited) name', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <DuplicateDialog
        open
        onOpenChange={vi.fn()}
        block={block}
        onSubmit={onSubmit}
        isSubmitting={false}
      />
    );

    const nameField = screen.getByLabelText('Name');
    await user.clear(nameField);
    await user.type(nameField, 'A different name');
    await user.click(screen.getByRole('button', { name: 'Duplicate' }));

    expect(onSubmit).toHaveBeenCalledWith('A different name');
  });

  it('rejects a name shorter than 2 characters', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <DuplicateDialog
        open
        onOpenChange={vi.fn()}
        block={block}
        onSubmit={onSubmit}
        isSubmitting={false}
      />
    );

    const nameField = screen.getByLabelText('Name');
    await user.clear(nameField);
    await user.type(nameField, 'a');
    await user.click(screen.getByRole('button', { name: 'Duplicate' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Must be at least 2 characters.')).toBeInTheDocument();
  });
});
