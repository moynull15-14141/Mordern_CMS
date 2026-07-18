import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentFormDialog } from './comment-form-dialog';

describe('CommentFormDialog', () => {
  it('submits the body field', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <CommentFormDialog open onOpenChange={vi.fn()} title="Edit" onSubmit={onSubmit} />
    );

    await user.type(screen.getByLabelText('Comment'), 'Updated body');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledWith('Updated body');
  });
});
