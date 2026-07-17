import { describe, expect, it, vi } from 'vitest';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast as sonnerToast } from 'sonner';
import { toast } from './toast';

describe('toast', () => {
  it('success() forwards the message and description to sonner', () => {
    toast.success('Saved', 'Your changes were saved.');
    expect(sonnerToast.success).toHaveBeenCalledWith('Saved', {
      description: 'Your changes were saved.',
    });
  });

  it('info() forwards the message and description to sonner', () => {
    toast.info('Heads up', 'Something to know.');
    expect(sonnerToast.info).toHaveBeenCalledWith('Heads up', {
      description: 'Something to know.',
    });
  });

  it('error() forces an infinite duration so failures require manual dismissal', () => {
    toast.error('Failed', 'Could not save.');
    expect(sonnerToast.error).toHaveBeenCalledWith('Failed', {
      description: 'Could not save.',
      duration: Number.POSITIVE_INFINITY,
    });
  });
});
