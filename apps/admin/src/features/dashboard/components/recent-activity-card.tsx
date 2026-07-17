import { History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/empty-state';

/** Recent Activity — Frontend Milestone 2 Dashboard Home scope. No durable
 * Audit/Activity Log backend exists yet (docs/52_BACKEND_FREEZE_REPORT.md
 * "Known Limitations": AuditLoggerService is log-line-only, never
 * persisted) — this renders an explicit empty state, never fabricated
 * entries, matching docs/60_ADMIN_NAVIGATION.md's same rule for
 * /activity-logs. */
export function RecentActivityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={History}
          title="No recent activity"
          description="Activity will appear here once the Audit module is available."
        />
      </CardContent>
    </Card>
  );
}
