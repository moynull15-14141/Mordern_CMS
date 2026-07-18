import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { CreateThemePageContent } from '@/features/themes';

export default function NewThemePage() {
  return (
    <PermissionRoute permissions={PERMISSIONS.THEME_MANAGE}>
      <CreateThemePageContent />
    </PermissionRoute>
  );
}
