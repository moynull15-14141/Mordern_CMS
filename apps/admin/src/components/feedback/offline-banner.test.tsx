import { afterEach, describe, expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { OfflineBanner } from './offline-banner';

afterEach(() => {
  Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
});

describe('OfflineBanner', () => {
  it('renders nothing while online', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    const { container } = render(<OfflineBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the offline message once the browser goes offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    render(<OfflineBanner />);
    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByRole('status')).toHaveTextContent(/offline/i);
  });

  it('hides again once back online', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    render(<OfflineBanner />);
    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      window.dispatchEvent(new Event('online'));
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
