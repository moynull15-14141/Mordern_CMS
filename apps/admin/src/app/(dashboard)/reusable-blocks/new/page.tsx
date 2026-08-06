import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { CreateReusableBlockPageContent } from '@/features/reusable-blocks';

export default function NewReusableBlockPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.PAGE_MANAGE}>
      <CreateReusableBlockPageContent />
    </PermissionRoute>
  );
}
