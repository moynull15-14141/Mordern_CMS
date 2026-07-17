import { STORAGE_KEYS } from '@/constants/storage-keys';
import type { AuthTokens } from '@/types/auth';

/**
 * Imperative token storage, shared by the Axios interceptors (lib/api-client.ts)
 * and the Auth Provider (providers/auth-provider.tsx) without creating a
 * circular dependency between a plain module and a React context. The
 * *mechanism* here (localStorage) is explicitly flagged as an
 * implementation-time-revisitable choice in docs/55_FRONTEND_HANDOFF.md's
 * Integration Checklist ("never in localStorage for a production app
 * handling sensitive content — prefer an httpOnly-cookie proxy layer...")
 * — kept simple for Frontend Milestone 1 foundation purposes, swappable
 * behind this same module's interface later without touching call sites.
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

// Listener registry so AuthProvider can read `hasTokens` via
// useSyncExternalStore instead of a synchronous setState-in-effect on mount
// (React's recommended pattern for syncing external mutable sources, and
// what avoids a server/client hydration mismatch — SSR has no localStorage).
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

function getAccessToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export const tokenStore = {
  getAccessToken,

  getRefreshToken(): string | null {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setTokens(tokens: AuthTokens): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    window.localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    notify();
  },

  clearTokens(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    window.localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    notify();
  },

  hasTokens(): boolean {
    return getAccessToken() !== null;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
