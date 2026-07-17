import { describe, expect, it } from 'vitest';
import { API_ENDPOINTS } from './api-endpoints';

describe('API_ENDPOINTS', () => {
  it('every AUTH path starts with /auth', () => {
    Object.values(API_ENDPOINTS.AUTH).forEach((path) => {
      expect(path.startsWith('/auth')).toBe(true);
    });
  });

  it('every top-level string endpoint starts with a leading slash', () => {
    const stringEndpoints = Object.values(API_ENDPOINTS).filter(
      (value) => typeof value === 'string'
    ) as string[];
    stringEndpoints.forEach((path) => {
      expect(path.startsWith('/')).toBe(true);
    });
  });

  it('exposes the authorization/me endpoint used by the Auth Provider', () => {
    expect(API_ENDPOINTS.AUTHORIZATION.ME).toBe('/authorization/me');
  });

  it('has no trailing slashes on any endpoint', () => {
    expect(API_ENDPOINTS.ARTICLES.endsWith('/')).toBe(false);
    expect(API_ENDPOINTS.AUTH.LOGIN.endsWith('/')).toBe(false);
  });
});
