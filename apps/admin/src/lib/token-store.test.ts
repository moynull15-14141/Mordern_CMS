import { afterEach, describe, expect, it, vi } from 'vitest';
import { tokenStore } from './token-store';
import { mockAuthTokens } from '@/test/fixtures/auth';

afterEach(() => {
  tokenStore.clearTokens();
  vi.restoreAllMocks();
});

describe('tokenStore', () => {
  it('has no tokens initially', () => {
    expect(tokenStore.hasTokens()).toBe(false);
    expect(tokenStore.getAccessToken()).toBeNull();
    expect(tokenStore.getRefreshToken()).toBeNull();
  });

  it('setTokens() persists both tokens to localStorage', () => {
    tokenStore.setTokens(mockAuthTokens({ accessToken: 'access-1', refreshToken: 'refresh-1' }));
    expect(tokenStore.getAccessToken()).toBe('access-1');
    expect(tokenStore.getRefreshToken()).toBe('refresh-1');
    expect(tokenStore.hasTokens()).toBe(true);
  });

  it('clearTokens() removes both tokens', () => {
    tokenStore.setTokens(mockAuthTokens({ accessToken: 'a', refreshToken: 'r' }));
    tokenStore.clearTokens();
    expect(tokenStore.hasTokens()).toBe(false);
  });

  it('subscribe() notifies listeners on setTokens() and clearTokens()', () => {
    const listener = vi.fn();
    const unsubscribe = tokenStore.subscribe(listener);

    tokenStore.setTokens(mockAuthTokens({ accessToken: 'a', refreshToken: 'r' }));
    expect(listener).toHaveBeenCalledTimes(1);

    tokenStore.clearTokens();
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
  });

  it('subscribe()s returned unsubscribe function stops further notifications', () => {
    const listener = vi.fn();
    const unsubscribe = tokenStore.subscribe(listener);
    unsubscribe();

    tokenStore.setTokens(mockAuthTokens({ accessToken: 'a', refreshToken: 'r' }));
    expect(listener).not.toHaveBeenCalled();
  });
});
