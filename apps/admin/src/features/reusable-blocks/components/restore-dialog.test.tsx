import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RestoreDialog } from './restore-dialog';

describe('RestoreDialog', () => {
  it('renders the block name in the confirmation description', () => {
    render(
      <RestoreDialog
        open
        onOpenChange={vi.fn()}
        blockName="Newsletter callout"
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByText('Restore "Newsletter callout"?', { exact: false })).toBeInTheDocument();
  });

  it('calls onConfirm when the Restore button is clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <RestoreDialog
        open
        onOpenChange={vi.fn()}
        blockName="Newsletter callout"
        onConfirm={onConfirm}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Restore' }));
    expect(onConfirm).toHaveBeenCalled();
  });
});
