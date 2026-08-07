import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { SaveAsPatternDialog } from './save-as-pattern-dialog';
import { patternsApi } from '../services/patterns.api';

vi.mock('../services/patterns.api', () => ({ patternsApi: { create: vi.fn() } }));
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
});

function wrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const sourceBlock = { id: 'b1', type: 'callout', data: { text: 'Subscribe' }, children: undefined };

describe('SaveAsPatternDialog', () => {
  it('submits the name/description/category/tags plus the source block wrapped as body.blocks', async () => {
    vi.mocked(patternsApi.create).mockResolvedValue({
      id: 'pattern-1',
      name: 'Callout section',
    } as never);
    const onSaved = vi.fn();
    const user = userEvent.setup();
    render(
      <SaveAsPatternDialog
        open
        onOpenChange={vi.fn()}
        sourceBlock={sourceBlock}
        onSaved={onSaved}
      />,
      {
        wrapper: wrapper(),
      }
    );

    await user.type(screen.getByLabelText('Name'), 'Callout section');
    await user.type(screen.getByLabelText('Tags'), 'marketing, cta');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(patternsApi.create).toHaveBeenCalledWith({
        name: 'Callout section',
        description: undefined,
        category: undefined,
        tags: ['marketing', 'cta'],
        body: {
          blocks: [{ id: 'b1', type: 'callout', data: { text: 'Subscribe' }, children: undefined }],
        },
      })
    );
    await waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith({ id: 'pattern-1', name: 'Callout section' })
    );
  });

  it('rejects a name shorter than 2 characters', async () => {
    const user = userEvent.setup();
    render(
      <SaveAsPatternDialog
        open
        onOpenChange={vi.fn()}
        sourceBlock={sourceBlock}
        onSaved={vi.fn()}
      />,
      {
        wrapper: wrapper(),
      }
    );

    await user.type(screen.getByLabelText('Name'), 'a');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Must be at least 2 characters.')).toBeInTheDocument();
    expect(patternsApi.create).not.toHaveBeenCalled();
  });

  it('shows an inline error and does not call onSaved when the API call fails', async () => {
    vi.mocked(patternsApi.create).mockRejectedValue(new Error('boom'));
    const onSaved = vi.fn();
    const user = userEvent.setup();
    render(
      <SaveAsPatternDialog
        open
        onOpenChange={vi.fn()}
        sourceBlock={sourceBlock}
        onSaved={onSaved}
      />,
      {
        wrapper: wrapper(),
      }
    );

    await user.type(screen.getByLabelText('Name'), 'Callout section');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
  });
});
