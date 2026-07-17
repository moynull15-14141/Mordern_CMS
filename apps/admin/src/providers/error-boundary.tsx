'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback renderer — falls back to a generic full-page error
   * state if omitted. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Global Error Boundary — docs/56_ADMIN_FRONTEND_ARCHITECTURE.md "Layout
 * System — Error Layout" / docs/55_FRONTEND_HANDOFF.md "Error Handling".
 * Class component (React error boundaries have no hook equivalent).
 * Catches render-time errors in the subtree beneath it; does NOT catch
 * errors inside event handlers or async code (those go through
 * lib/error-handler.ts's toast-based path instead).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback(error, this.reset);
    }

    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <AlertTriangle className="size-10 text-destructive" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-lg font-semibold">Something went wrong</p>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred while rendering this page.
          </p>
        </div>
        <Button onClick={this.reset}>Try again</Button>
      </div>
    );
  }
}
