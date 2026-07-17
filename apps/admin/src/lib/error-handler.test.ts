import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

import { toast as sonnerToast } from 'sonner';
import { handleMutationError } from './error-handler';
import { ApiError } from './api-error';

afterEach(() => {
  vi.clearAllMocks();
});

describe('handleMutationError', () => {
  it('shows an error toast with the ApiError message', () => {
    handleMutationError(new ApiError({ message: 'Could not save.', code: 'BUSINESS_FAILURE' }));
    expect(sonnerToast.error).toHaveBeenCalledWith(
      'Could not save.',
      expect.objectContaining({ duration: Number.POSITIVE_INFINITY })
    );
  });

  it('does not show a toast for a 401 — that is owned by the refresh-queue redirect', () => {
    handleMutationError(
      new ApiError({ message: 'Unauthorized', code: 'AUTH_UNAUTHORIZED', status: 401 })
    );
    expect(sonnerToast.error).not.toHaveBeenCalled();
  });

  it('wraps a plain Error into an UNKNOWN_ERROR ApiError and shows its message', () => {
    handleMutationError(new Error('Totally unexpected'));
    expect(sonnerToast.error).toHaveBeenCalledWith('Totally unexpected', expect.anything());
  });

  it('falls back to a generic message for a non-Error thrown value', () => {
    handleMutationError('a string was thrown');
    expect(sonnerToast.error).toHaveBeenCalledWith(
      'An unexpected error occurred.',
      expect.anything()
    );
  });
});
