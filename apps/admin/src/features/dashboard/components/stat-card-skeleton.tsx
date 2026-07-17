import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export interface StatCardSkeletonProps {
  label: string;
  icon: LucideIcon;
}

/** Statistic card — Frontend Milestone 2 Dashboard Home scope: "Everything
 * uses skeletons. No fake data. No resource queries." This card never
 * fetches or fabricates a number — the value slot is permanently a
 * Skeleton until a real resource-count endpoint is wired in a future
 * milestone. */
export function StatCardSkeleton({ label, icon: Icon }: StatCardSkeletonProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-16" />
      </CardContent>
    </Card>
  );
}
