import { QueryClient } from '@tanstack/react-query';
import { isApiError } from '@/lib/api-error';

/**
 * The ONE TanStack QueryClient instance — docs/56_ADMIN_FRONTEND_ARCHITECTURE.md
 * "API Layer" / "Performance Strategy" (Caching). Retry policy explicitly
 * never retries a 4xx (correctness errors, not transient ones) per
 * docs/56 "API Layer": "TanStack Query's built-in retry... network/5xx
 * errors only."
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 3) return false;
  if (isApiError(error)) {
    if (error.status !== undefined && error.status < 500) return false;
  }
  return true;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
