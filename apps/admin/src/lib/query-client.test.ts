import { describe, expect, it } from 'vitest';
import { createQueryClient } from './query-client';
import { ApiError } from './api-error';

describe('createQueryClient', () => {
  it('sets a 30s staleTime and 5min gcTime for queries', () => {
    const client = createQueryClient();
    const defaults = client.getDefaultOptions().queries;
    expect(defaults?.staleTime).toBe(30 * 1000);
    expect(defaults?.gcTime).toBe(5 * 60 * 1000);
  });

  it('disables refetchOnWindowFocus', () => {
    const client = createQueryClient();
    expect(client.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false);
  });

  it('disables mutation retries', () => {
    const client = createQueryClient();
    expect(client.getDefaultOptions().mutations?.retry).toBe(false);
  });

  describe('query retry policy', () => {
    function retry(
      client: ReturnType<typeof createQueryClient>,
      count: number,
      error: unknown
    ): boolean {
      const fn = client.getDefaultOptions().queries?.retry;
      if (typeof fn !== 'function') throw new Error('retry is not a function');
      return fn(count, error as Error);
    }

    it('never retries a 4xx ApiError', () => {
      const client = createQueryClient();
      const error = new ApiError({ message: 'bad', code: 'VALIDATION_X', status: 400 });
      expect(retry(client, 0, error)).toBe(false);
    });

    it('retries a 5xx ApiError up to the cap', () => {
      const client = createQueryClient();
      const error = new ApiError({ message: 'oops', code: 'SERVER', status: 500 });
      expect(retry(client, 0, error)).toBe(true);
      expect(retry(client, 2, error)).toBe(true);
      expect(retry(client, 3, error)).toBe(false);
    });

    it('retries a non-ApiError (e.g. a thrown network exception) up to the cap', () => {
      const client = createQueryClient();
      expect(retry(client, 0, new Error('boom'))).toBe(true);
      expect(retry(client, 3, new Error('boom'))).toBe(false);
    });
  });
});
