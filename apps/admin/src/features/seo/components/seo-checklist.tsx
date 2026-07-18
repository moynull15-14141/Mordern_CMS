import { Check, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { SeoCheck } from '../lib/seo-score';

export function SeoChecklist({ checks }: { checks: SeoCheck[] }) {
  return (
    <ul className="space-y-2">
      {checks.map((check) => (
        <li key={check.id} className="flex items-start gap-2 text-sm">
          {check.passed ? (
            <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
          ) : (
            <X className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          )}
          <div>
            <span className={cn('font-medium', !check.passed && 'text-destructive')}>
              {check.label}
            </span>
            <p className="text-xs text-muted-foreground">{check.message}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
