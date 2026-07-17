import { afterEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { LoadingProvider } from './loading-provider';
import { useLoadingStore } from '@/stores/loading-store';

afterEach(() => {
  act(() => {
    useLoadingStore.setState({ activeCount: 0, isLoading: false });
  });
});

describe('LoadingProvider', () => {
  it('always renders its children', () => {
    render(
      <LoadingProvider>
        <div>Page content</div>
      </LoadingProvider>
    );
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });

  it('renders the progress bar as aria-hidden when not loading', () => {
    render(
      <LoadingProvider>
        <div>content</div>
      </LoadingProvider>
    );
    expect(screen.getByRole('progressbar', { hidden: true })).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('exposes the progress bar (not aria-hidden) once the loading store is active', () => {
    render(
      <LoadingProvider>
        <div>content</div>
      </LoadingProvider>
    );
    act(() => useLoadingStore.getState().start());
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-hidden', 'false');
  });
});
