import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { throttle } from './throttle';

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('invokes immediately on the first call', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('a');
    expect(fn).toHaveBeenCalledWith('a');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('suppresses calls made during the cooldown window', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('a');
    throttled('b');
    throttled('c');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('invokes once more with the latest pending args after cooldown', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('a');
    throttled('b');
    throttled('c');
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('c');
  });

  it('allows a fresh call once cooldown has fully elapsed with no pending call', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('a');
    vi.advanceTimersByTime(100);
    throttled('b');

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('b');
  });
});
