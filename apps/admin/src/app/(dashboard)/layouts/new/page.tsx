import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { CreateLayoutPageContent } from '@/features/layouts';

export default function NewLayoutPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.LAYOUT_MANAGE}>
      <CreateLayoutPageContent />
    </PermissionRoute>
  );
}
