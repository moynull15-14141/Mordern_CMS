import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivateDialog } from './activate-dialog';

describe('ActivateDialog', () => {
  it('renders the theme name in the confirmation description', () => {
    render(<ActivateDialog open onOpenChange={vi.fn()} themeName="Classic" onConfirm={vi.fn()} />);
    expect(screen.getByText('Activate "Classic"?', { exact: false })).toBeInTheDocument();
  });

  it('calls onConfirm when the Activate button is clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <ActivateDialog open onOpenChange={vi.fn()} themeName="Classic" onConfirm={onConfirm} />
    );

    await user.click(screen.getByRole('button', { name: 'Activate' }));
    expect(onConfirm).toHaveBeenCalled();
  });
});
