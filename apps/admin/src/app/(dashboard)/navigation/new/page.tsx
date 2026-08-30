import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { CreateNavigationPageContent } from '@/features/navigation';

export default function NewNavigationPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.MENU_MANAGE}>
      <CreateNavigationPageContent />
    </PermissionRoute>
  );
}
