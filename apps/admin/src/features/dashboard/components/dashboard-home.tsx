import { FileText, FolderTree, MessageSquare, Users } from 'lucide-react';
import { PageContainer, ContentContainer } from '@/components/layout/containers';
import { PageHeader } from '@/components/layout/page-header';
import { StatCardSkeleton } from '@/features/dashboard/components/stat-card-skeleton';
import { QuickActions } from '@/features/dashboard/components/quick-actions';
import { RecentActivityCard } from '@/features/dashboard/components/recent-activity-card';
import { SystemStatusCard } from '@/features/dashboard/components/system-status-card';
import { ProfileSummaryCard } from '@/features/dashboard/components/profile-summary-card';

const STAT_CARDS = [
  { label: 'Articles', icon: FileText },
  { label: 'Categories', icon: FolderTree },
  { label: 'Comments', icon: MessageSquare },
  { label: 'Users', icon: Users },
] as const;

/** Dashboard Home — Frontend Milestone 2 scope. Application shell only:
 * every widget is either real session data already in the query cache
 * (Profile Summary) or a permanent Skeleton/EmptyState placeholder (Stats,
 * Recent Activity, System Status) — no resource query is issued here. */
export function DashboardHome() {
  return (
    <PageContainer>
      <ContentContainer>
        <PageHeader title="Dashboard" description="Overview of your admin panel." />

        <ProfileSummaryCard />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_CARDS.map(({ label, icon }) => (
            <StatCardSkeleton key={label} label={label} icon={icon} />
          ))}
        </div>

        <QuickActions />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RecentActivityCard />
          <SystemStatusCard />
        </div>
      </ContentContainer>
    </PageContainer>
  );
}
