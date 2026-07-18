import { Check, X } from 'lucide-react';
import { cn } from '@/utils/cn';

const RECOMMENDED_MAX = 60;

/** Frontend-only static analysis (lowercase/hyphenated/length) — the
 * backend has no slug-analysis endpoint and no duplicate-slug check
 * exposed outside of the create/update 409 response, so "duplicate
 * warning" is intentionally omitted here (see docs/68_FRONTEND_SEO.md
 * "Remaining Backend Limitations"). */
export function SlugAnalyzer({ slug }: { slug: string }) {
  const isLowercase = slug === slug.toLowerCase();
  const isHyphenated = !slug.includes('_') && !slug.includes(' ');
  const isReadable = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  const withinLength = slug.length > 0 && slug.length <= RECOMMENDED_MAX;

  const rules = [
    { label: 'Lowercase', passed: isLowercase },
    { label: 'Hyphen-separated', passed: isHyphenated },
    { label: 'Readable (no special characters)', passed: isReadable },
    { label: `Recommended length (≤ ${RECOMMENDED_MAX} characters)`, passed: withinLength },
  ];

  return (
    <ul className="space-y-1">
      {rules.map((rule) => (
        <li key={rule.label} className="flex items-center gap-2 text-sm">
          {rule.passed ? (
            <Check className="size-3.5 text-success" aria-hidden="true" />
          ) : (
            <X className="size-3.5 text-destructive" aria-hidden="true" />
          )}
          <span className={cn(!rule.passed && 'text-muted-foreground')}>{rule.label}</span>
        </li>
      ))}
    </ul>
  );
}
