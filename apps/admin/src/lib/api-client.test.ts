import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { api, apiClient, onSessionExpired } from './api-client';
import { tokenStore } from './token-store';
import { ApiError, isApiError } from './api-error';
import { mockAuthTokens } from '@/test/fixtures/auth';

function getRequestFulfilled() {
  return (apiClient.interceptors.request as any).handlers[0].fulfilled as (
    config: InternalAxiosRequestConfig
  ) => InternalAxiosRequestConfig;
}

function getResponseHandlers() {
  const handler = (apiClient.interceptors.response as any).handlers[0];
  return { fulfilled: handler.fulfilled, rejected: handler.rejected };
}

function makeConfig(
  overrides: Partial<InternalAxiosRequestConfig> = {}
): InternalAxiosRequestConfig {
  return {
    headers: { set: vi.fn() } as unknown as InternalAxiosRequestConfig['headers'],
    ...overrides,
  } as InternalAxiosRequestConfig;
}

afterEach(() => {
  tokenStore.clearTokens();
  vi.restoreAllMocks();
});

describe('request interceptor', () => {
  it('injects a Bearer token when one is stored and the request is not public', () => {
    tokenStore.setTokens(mockAuthTokens({ accessToken: 'token-123', refreshToken: 'refresh-1' }));
    const config = makeConfig();
    getRequestFulfilled()(config);
    expect(config.headers.set).toHaveBeenCalledWith('Authorization', 'Bearer token-123');
  });

  it('does not inject a token when the request is marked public', () => {
    tokenStore.setTokens(mockAuthTokens({ accessToken: 'token-123', refreshToken: 'refresh-1' }));
    const config = makeConfig({ public: true } as Partial<InternalAxiosRequestConfig>);
    getRequestFulfilled()(config);
    expect(config.headers.set).not.toHaveBeenCalled();
  });

  it('does not inject a token when none is stored', () => {
    const config = makeConfig();
    getRequestFulfilled()(config);
    expect(config.headers.set).not.toHaveBeenCalled();
  });
});

describe('response interceptor — success path', () => {
  it('unwraps a successful envelope to its bare data', () => {
    const { fulfilled } = getResponseHandlers();
    const result = fulfilled({
      data: { success: true, message: 'ok', data: { id: 1 }, meta: {}, errors: [] },
    });
    expect(result).toEqual({ id: 1 });
  });

  it('throws an ApiError when the envelope itself reports success: false', () => {
    const { fulfilled } = getResponseHandlers();
    expect(() =>
      fulfilled({
        data: {
          success: false,
          message: 'Failed',
          data: null,
          meta: {},
          errors: [{ code: 'BUSINESS_X', message: 'nope' }],
        },
      })
    ).toThrow(ApiError);
  });
});

describe('response interceptor — error path', () => {
  it('maps a network error (no response) to a NETWORK_ERROR ApiError', async () => {
    const { rejected } = getResponseHandlers();
    const axiosError = Object.assign(new Error('Network Error'), {
      isAxiosError: true,
      config: makeConfig(),
    });
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    await expect(rejected(axiosError)).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });

  it('maps a 4xx response error to a typed ApiError carrying the status and backend error code', async () => {
    const { rejected } = getResponseHandlers();
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);
    const axiosError = Object.assign(new Error('Request failed'), {
      isAxiosError: true,
      config: makeConfig(),
      response: {
        status: 422,
        data: {
          success: false,
          message: 'Validation failed',
          data: null,
          meta: {},
          errors: [{ code: 'VALIDATION_REQUIRED', message: 'Name is required' }],
        },
      },
    });

    await expect(rejected(axiosError)).rejects.toMatchObject({
      code: 'VALIDATION_REQUIRED',
      status: 422,
      message: 'Name is required',
    });
  });

  it('does not attempt a refresh for a public request that 401s', async () => {
    const { rejected } = getResponseHandlers();
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);
    const requestSpy = vi.spyOn(apiClient, 'request');
    const axiosError = Object.assign(new Error('Unauthorized'), {
      isAxiosError: true,
      config: makeConfig({ public: true } as Partial<InternalAxiosRequestConfig>),
      response: {
        status: 401,
        data: { success: false, message: 'Unauthorized', data: null, meta: {}, errors: [] },
      },
    });

    await expect(rejected(axiosError)).rejects.toBeInstanceOf(ApiError);
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it('refreshes the token once on a 401 and retries the original request', async () => {
    tokenStore.setTokens(mockAuthTokens({ accessToken: 'stale', refreshToken: 'refresh-1' }));
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);
    vi.spyOn(axios, 'post').mockResolvedValue({
      data: {
        success: true,
        message: 'ok',
        data: { accessToken: 'fresh', refreshToken: 'refresh-2', expiresIn: 3600 },
        meta: {},
        errors: [],
      },
    });
    vi.spyOn(apiClient, 'request').mockResolvedValue({
      data: { success: true, message: 'ok', data: { id: 42 }, meta: {}, errors: [] },
    });

    const { rejected } = getResponseHandlers();
    const originalConfig = makeConfig();
    const axiosError = Object.assign(new Error('Unauthorized'), {
      isAxiosError: true,
      config: originalConfig,
      response: {
        status: 401,
        data: { success: false, message: 'Unauthorized', data: null, meta: {}, errors: [] },
      },
    });

    const result = await rejected(axiosError);

    expect(result).toEqual({ id: 42 });
    expect(tokenStore.getAccessToken()).toBe('fresh');
    expect(originalConfig.headers.set).toHaveBeenCalledWith('Authorization', 'Bearer fresh');
  });

  it('clears tokens and notifies onSessionExpired listeners when the refresh itself fails', async () => {
    tokenStore.setTokens(mockAuthTokens({ accessToken: 'stale', refreshToken: 'refresh-1' }));
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('refresh failed'));

    const listener = vi.fn();
    const unsubscribe = onSessionExpired(listener);

    const { rejected } = getResponseHandlers();
    const axiosError = Object.assign(new Error('Unauthorized'), {
      isAxiosError: true,
      config: makeConfig(),
      response: {
        status: 401,
        data: { success: false, message: 'Unauthorized', data: null, meta: {}, errors: [] },
      },
    });

    await expect(rejected(axiosError)).rejects.toBeInstanceOf(ApiError);
    expect(tokenStore.hasTokens()).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });
});

describe('api typed wrappers', () => {
  beforeEach(() => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({ id: 1 } as never);
    vi.spyOn(apiClient, 'post').mockResolvedValue({ ok: true } as never);
  });

  it('api.get delegates to apiClient.get and resolves the unwrapped value', async () => {
    await expect(api.get('/articles')).resolves.toEqual({ id: 1 });
    expect(apiClient.get).toHaveBeenCalledWith('/articles', undefined);
  });

  it('api.post delegates to apiClient.post with the given payload', async () => {
    await expect(api.post('/articles', { title: 'x' })).resolves.toEqual({ ok: true });
    expect(apiClient.post).toHaveBeenCalledWith('/articles', { title: 'x' }, undefined);
  });

  it('api.post forwards a RequestOptions config (e.g. { public: true }) through to apiClient.post', async () => {
    await api.post('/auth/login', { email: 'a@b.com', password: 'x' }, { public: true });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/auth/login',
      { email: 'a@b.com', password: 'x' },
      { public: true }
    );
  });
});

describe('isApiError re-export sanity', () => {
  it('correctly narrows an ApiError thrown by the interceptor', async () => {
    const { fulfilled } = getResponseHandlers();
    try {
      fulfilled({ data: { success: false, message: 'x', data: null, meta: {}, errors: [] } });
    } catch (error) {
      expect(isApiError(error)).toBe(true);
    }
  });
});
