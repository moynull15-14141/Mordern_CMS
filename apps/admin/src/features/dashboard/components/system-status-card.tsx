import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/** System Status — Frontend Milestone 2 Dashboard Home scope: "Backend
 * health placeholder... No health endpoint call." This deliberately never
 * calls `GET /health` — a permanent Skeleton, not a real (or fabricated)
 * status badge, until a future milestone wires an actual health check. */
export function SystemStatusCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>Status checks are not yet available.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}
