import { describe, expect, it } from 'vitest';
import { buildLoginRedirectUrl, getRedirectTarget, isPublicRoute } from './routes';
import { ROUTES } from '@/constants/routes';

describe('isPublicRoute', () => {
  it('returns true for an exact public route match', () => {
    expect(isPublicRoute(ROUTES.LOGIN)).toBe(true);
  });

  it('returns true for a nested path under a public route', () => {
    expect(isPublicRoute(`${ROUTES.RESET_PASSWORD}/abc123`)).toBe(true);
  });

  it('returns false for a protected route', () => {
    expect(isPublicRoute(ROUTES.DASHBOARD)).toBe(false);
  });
});

describe('buildLoginRedirectUrl', () => {
  it('returns the bare login route when the current path is itself public', () => {
    expect(buildLoginRedirectUrl(ROUTES.LOGIN)).toBe(ROUTES.LOGIN);
  });

  it('appends a redirect query param preserving the originally requested path', () => {
    expect(buildLoginRedirectUrl(ROUTES.DASHBOARD)).toBe(`${ROUTES.LOGIN}?redirect=%2Fdashboard`);
  });
});

describe('getRedirectTarget', () => {
  it('returns the redirect param when it is a safe relative path', () => {
    const params = new URLSearchParams({ redirect: '/articles' });
    expect(getRedirectTarget(params)).toBe('/articles');
  });

  it('falls back to the dashboard when no redirect param is present', () => {
    expect(getRedirectTarget(new URLSearchParams())).toBe(ROUTES.DASHBOARD);
  });

  it('rejects a protocol-relative URL to avoid an open redirect', () => {
    const params = new URLSearchParams({ redirect: '//evil.com' });
    expect(getRedirectTarget(params)).toBe(ROUTES.DASHBOARD);
  });

  it('rejects an absolute external URL', () => {
    const params = new URLSearchParams({ redirect: 'https://evil.com' });
    expect(getRedirectTarget(params)).toBe(ROUTES.DASHBOARD);
  });

  it('honors a custom fallback', () => {
    expect(getRedirectTarget(new URLSearchParams(), ROUTES.SETTINGS)).toBe(ROUTES.SETTINGS);
  });
});
