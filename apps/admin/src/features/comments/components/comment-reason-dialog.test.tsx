import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentReasonDialog } from './comment-reason-dialog';

describe('CommentReasonDialog', () => {
  it('submits an optional reason', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <CommentReasonDialog open onOpenChange={vi.fn()} title="Spam" onSubmit={onSubmit} />
    );

    await user.type(screen.getByLabelText('Reason'), 'looks like spam');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith('looks like spam');
  });
});
