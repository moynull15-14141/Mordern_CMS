import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResponsiveVisibilityFields } from './responsive-visibility-fields';

describe('ResponsiveVisibilityFields', () => {
  it('reflects existing values', () => {
    render(<ResponsiveVisibilityFields value={{ hideOnMobile: true }} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Hide on mobile')).toBeChecked();
    expect(screen.getByLabelText('Hide on tablet')).not.toBeChecked();
  });

  it('calls onChange with the updated breakpoint merged into the existing value', async () => {
    const onChange = vi.fn();
    render(<ResponsiveVisibilityFields value={{ hideOnMobile: true }} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Hide on desktop'));
    expect(onChange).toHaveBeenCalledWith({ hideOnMobile: true, hideOnDesktop: true });
  });

  it('handles an undefined initial value', () => {
    render(<ResponsiveVisibilityFields value={undefined} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Hide on mobile')).not.toBeChecked();
  });
});
