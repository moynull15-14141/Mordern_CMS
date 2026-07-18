import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SeoScoreRing } from './seo-score-ring';
import { SeoStatusBadge } from './seo-status-badge';
import { SeoIssueList } from './seo-issue-list';
import type { SeoScoreResult } from '../lib/seo-score';

export function SeoHealthPanel({ result }: { result: SeoScoreResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <SeoScoreRing score={result.score} status={result.status} />
          <div className="space-y-2">
            <SeoStatusBadge status={result.status} />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <dt className="text-muted-foreground">Passed</dt>
              <dd className="text-right font-medium text-success">{result.passed.length}</dd>
              <dt className="text-muted-foreground">Warnings</dt>
              <dd className="text-right font-medium text-warning">{result.warnings.length}</dd>
              <dt className="text-muted-foreground">Errors</dt>
              <dd className="text-right font-medium text-destructive">{result.errors.length}</dd>
              <dt className="text-muted-foreground">Completion</dt>
              <dd className="text-right font-medium">{result.completion}%</dd>
            </dl>
          </div>
        </div>
        <SeoIssueList checks={result.checks} />
      </CardContent>
    </Card>
  );
}
