import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LayoutProvider, useLayout } from './layout-context';

function Consumer() {
  const { preset, source } = useLayout();
  return (
    <div>
      <span data-testid="preset">{preset}</span>
      <span data-testid="source">{source}</span>
    </div>
  );
}

describe('LayoutProvider / useLayout', () => {
  it('provides the resolved layout to descendants', () => {
    render(
      <LayoutProvider resolution={{ preset: 'sidebar-left', source: 'explicit' }}>
        <Consumer />
      </LayoutProvider>
    );
    expect(screen.getByTestId('preset')).toHaveTextContent('sidebar-left');
    expect(screen.getByTestId('source')).toHaveTextContent('explicit');
  });

  it('throws a clear error when useLayout() is used outside a LayoutProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(/must be used within/);
    consoleError.mockRestore();
  });
});
