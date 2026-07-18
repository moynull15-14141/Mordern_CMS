'use client';

import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { SeoCheck } from '../lib/seo-score';

const GROUP_ORDER = ['critical', 'warning', 'suggestion'] as const;
const GROUP_LABEL = { critical: 'Critical', warning: 'Warning', suggestion: 'Suggestion' } as const;
const GROUP_ICON = { critical: AlertCircle, warning: AlertTriangle, suggestion: Info } as const;

/** Groups failing checks by severity; clicking an item scrolls to the
 * matching editor section (sections are id'd `seo-section-<checkId>`). */
export function SeoIssueList({ checks }: { checks: SeoCheck[] }) {
  const failing = checks.filter((c) => !c.passed);
  if (failing.length === 0) {
    return <p className="text-sm text-muted-foreground">No issues found. Great work.</p>;
  }

  return (
    <div className="space-y-4">
      {GROUP_ORDER.map((severity) => {
        const items = failing.filter((c) => c.severity === severity);
        if (items.length === 0) return null;
        const Icon = GROUP_ICON[severity];
        return (
          <div key={severity}>
            <h4
              className={cn(
                'mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide',
                severity === 'critical' && 'text-destructive',
                severity === 'warning' && 'text-warning',
                severity === 'suggestion' && 'text-muted-foreground'
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {GROUP_LABEL[severity]} ({items.length})
            </h4>
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      document
                        .getElementById(`seo-section-${item.id}`)
                        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="text-left text-sm text-foreground underline-offset-2 hover:underline"
                  >
                    {item.message}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
