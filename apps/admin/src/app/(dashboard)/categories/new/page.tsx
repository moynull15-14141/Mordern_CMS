import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { CreateCategoryPageContent } from '@/features/categories';

export default function NewCategoryPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.CATEGORY_CREATE}>
      <CreateCategoryPageContent />
    </PermissionRoute>
  );
}
