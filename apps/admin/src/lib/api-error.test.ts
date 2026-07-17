import { describe, expect, it } from 'vitest';
import { ApiError, isApiError } from './api-error';

describe('ApiError', () => {
  it('sets message, code, and name', () => {
    const error = new ApiError({ message: 'Boom', code: 'BUSINESS_FAILURE' });
    expect(error.message).toBe('Boom');
    expect(error.code).toBe('BUSINESS_FAILURE');
    expect(error.name).toBe('ApiError');
  });

  it('defaults errors to an empty array', () => {
    const error = new ApiError({ message: 'x', code: 'X' });
    expect(error.errors).toEqual([]);
  });

  describe('isNotFound', () => {
    it('is true for a BUSINESS_NOT_FOUND code', () => {
      expect(new ApiError({ message: 'x', code: 'BUSINESS_NOT_FOUND' }).isNotFound).toBe(true);
    });
    it('is true for a 404 status regardless of code', () => {
      expect(new ApiError({ message: 'x', code: 'OTHER', status: 404 }).isNotFound).toBe(true);
    });
    it('is false otherwise', () => {
      expect(new ApiError({ message: 'x', code: 'OTHER', status: 500 }).isNotFound).toBe(false);
    });
  });

  it('isForbidden is true only for a 403 status', () => {
    expect(new ApiError({ message: 'x', code: 'X', status: 403 }).isForbidden).toBe(true);
    expect(new ApiError({ message: 'x', code: 'X', status: 401 }).isForbidden).toBe(false);
  });

  it('isUnauthorized is true only for a 401 status', () => {
    expect(new ApiError({ message: 'x', code: 'X', status: 401 }).isUnauthorized).toBe(true);
    expect(new ApiError({ message: 'x', code: 'X', status: 403 }).isUnauthorized).toBe(false);
  });

  it('isValidation is true for any VALIDATION_-prefixed code', () => {
    expect(new ApiError({ message: 'x', code: 'VALIDATION_REQUIRED' }).isValidation).toBe(true);
    expect(new ApiError({ message: 'x', code: 'BUSINESS_FAILURE' }).isValidation).toBe(false);
  });

  it('isNetworkError is true only for the NETWORK_ERROR code', () => {
    expect(new ApiError({ message: 'x', code: 'NETWORK_ERROR' }).isNetworkError).toBe(true);
    expect(new ApiError({ message: 'x', code: 'OTHER' }).isNetworkError).toBe(false);
  });
});

describe('isApiError', () => {
  it('returns true for an ApiError instance', () => {
    expect(isApiError(new ApiError({ message: 'x', code: 'X' }))).toBe(true);
  });

  it('returns false for a plain Error', () => {
    expect(isApiError(new Error('x'))).toBe(false);
  });

  it('returns false for a non-error value', () => {
    expect(isApiError('nope')).toBe(false);
    expect(isApiError(null)).toBe(false);
  });
});
