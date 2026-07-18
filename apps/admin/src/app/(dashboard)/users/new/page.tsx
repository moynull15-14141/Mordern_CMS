import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { CreateUserPageContent } from '@/features/users';

export default function NewUserPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.USERS_MANAGE}>
      <CreateUserPageContent />
    </PermissionRoute>
  );
}
