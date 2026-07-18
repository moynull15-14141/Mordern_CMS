import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { CreateTagPageContent } from '@/features/tags';

export default function NewTagPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.CATEGORY_CREATE}>
      <CreateTagPageContent />
    </PermissionRoute>
  );
}
