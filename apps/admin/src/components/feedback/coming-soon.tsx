import { Construction } from 'lucide-react';
import { EmptyState } from '@/components/feedback/empty-state';

export interface ComingSoonProps {
  title: string;
}

/** Placeholder for a nav-manifest route whose feature module hasn't shipped
 * yet — Frontend Milestone 2 "Navigation" scope: "Feature pages may still
 * show 'Coming Soon' until later milestones." Never fabricates data. */
export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <EmptyState
      icon={Construction}
      title={`${title} isn't available yet`}
      description="This section is planned for a future release."
    />
  );
}
