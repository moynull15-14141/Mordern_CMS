import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScheduleDialog } from './schedule-dialog';

describe('ScheduleDialog', () => {
  it('rejects a past date-time and does not submit', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <ScheduleDialog open onOpenChange={vi.fn()} articleTitle="Hello World" onSubmit={onSubmit} isSubmitting={false} />,
    );

    await user.type(screen.getByLabelText(/Publish date/), '2020-01-01T10:00');
    await user.click(screen.getByRole('button', { name: 'Schedule' }));

    await waitFor(() => expect(screen.getByText('Must be a future date and time.')).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a future date-time as an ISO string', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const localValue = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}T10:00`;

    render(
      <ScheduleDialog open onOpenChange={vi.fn()} articleTitle="Hello World" onSubmit={onSubmit} isSubmitting={false} />,
    );

    await user.type(screen.getByLabelText(/Publish date/), localValue);
    await user.click(screen.getByRole('button', { name: 'Schedule' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const submitted = onSubmit.mock.calls[0][0];
    expect(new Date(submitted.scheduledAt).getTime()).toBeGreaterThan(Date.now());
  });
});
