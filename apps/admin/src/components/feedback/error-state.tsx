import { AlertTriangle, Ban, RotateCw, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isApiError } from '@/lib/api-error';
import { cn } from '@/utils/cn';

export interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

/**
 * One ErrorState distinguishing three cases by `errors[0].code` —
 * docs/57_DESIGN_SYSTEM.md "Error State" / docs/55_FRONTEND_HANDOFF.md
 * "Error Handling". The correct user action differs by case: not-found
 * and forbidden never show a retry button (retrying won't help);
 * transient errors do.
 */
export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const apiError = isApiError(error) ? error : null;

  if (apiError?.isNotFound) {
    return (
      <Placeholder
        icon={SearchX}
        title="Not found"
        description="This doesn't exist, or may have been removed."
        className={className}
      />
    );
  }

  if (apiError?.isForbidden) {
    return (
      <Placeholder
        icon={Ban}
        title="You don't have permission"
        description="Contact an administrator if you believe this is a mistake."
        className={className}
      />
    );
  }

  return (
    <Placeholder
      icon={AlertTriangle}
      title="Something went wrong"
      description={apiError?.message ?? 'An unexpected error occurred. Please try again.'}
      className={className}
      action={
        onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCw className="size-4" aria-hidden="true" />
            Retry
          </Button>
        ) : undefined
      }
    />
  );
}

function Placeholder({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: typeof AlertTriangle;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-md border border-border py-12 text-center',
        className
      )}
    >
      <Icon className="size-10 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
