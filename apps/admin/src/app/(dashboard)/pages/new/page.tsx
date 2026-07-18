import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { CreatePagePageContent } from '@/features/pages';

export default function NewPagePage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.PAGE_MANAGE}>
      <CreatePagePageContent />
    </PermissionRoute>
  );
}
