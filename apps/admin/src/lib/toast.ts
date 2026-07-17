import { toast as sonnerToast } from 'sonner';

/**
 * Thin wrapper enforcing docs/57_DESIGN_SYSTEM.md's Toast rule: "auto-dismiss
 * after a fixed duration except error, which requires manual dismissal so a
 * failure is never missed." Every call site uses this instead of importing
 * `sonner` directly, so the rule can never be silently bypassed.
 */
export const toast = {
  success: (message: string, description?: string) => sonnerToast.success(message, { description }),
  info: (message: string, description?: string) => sonnerToast.info(message, { description }),
  error: (message: string, description?: string) =>
    sonnerToast.error(message, { description, duration: Number.POSITIVE_INFINITY }),
};
