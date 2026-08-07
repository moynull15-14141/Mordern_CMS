import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { CreatePatternPageContent } from '@/features/patterns';

export default function NewPatternPage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.PAGE_MANAGE}>
      <CreatePatternPageContent />
    </PermissionRoute>
  );
}
