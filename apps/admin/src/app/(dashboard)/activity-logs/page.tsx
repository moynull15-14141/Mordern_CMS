import { ComingSoonPage } from '@/components/layout/coming-soon-page';
import { PERMISSIONS } from '@/constants/permissions';

export default function ActivityLogsPage() {
  return <ComingSoonPage title="Activity Logs" permissions={PERMISSIONS.SYSTEM_MANAGE} />;
}
