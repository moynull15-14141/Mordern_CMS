import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { DashboardHome } from '@/features/dashboard';

export default function DashboardPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.DASHBOARD_VIEW}>
      <DashboardHome />
    </PermissionRoute>
  );
}
