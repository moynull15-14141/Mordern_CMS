import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PublishDialog } from './publish-dialog';

describe('PublishDialog', () => {
  it('calls onConfirm when the Publish button is clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<PublishDialog open onOpenChange={vi.fn()} articleTitle="Hello World" onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: 'Publish' }));
    expect(onConfirm).toHaveBeenCalled();
  });
});
