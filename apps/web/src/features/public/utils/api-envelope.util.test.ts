import { describe, expect, it } from 'vitest';
import { unwrapEnvelope } from './api-envelope.util';
import { PublicApiError } from './errors';
import type { ApiEnvelope } from '../types/api-envelope.types';

describe('unwrapEnvelope', () => {
  it('returns data when success is true', () => {
    const envelope: ApiEnvelope<{ id: string }> = {
      success: true,
      message: 'ok',
      data: { id: '1' },
      meta: {},
      errors: [],
    };
    expect(unwrapEnvelope(envelope)).toEqual({ id: '1' });
  });

  it('throws PublicApiError when success is false', () => {
    const envelope: ApiEnvelope<null> = {
      success: false,
      message: 'failed',
      data: null,
      meta: {},
      errors: [{ code: 'NOT_FOUND', message: 'Not found' }],
    };

    expect(() => unwrapEnvelope(envelope)).toThrow(PublicApiError);
    try {
      unwrapEnvelope(envelope);
    } catch (error) {
      expect(error).toBeInstanceOf(PublicApiError);
      expect((error as PublicApiError).code).toBe('NOT_FOUND');
      expect((error as PublicApiError).message).toBe('Not found');
    }
  });
});
