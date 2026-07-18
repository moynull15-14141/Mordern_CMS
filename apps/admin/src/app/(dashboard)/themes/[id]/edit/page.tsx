import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { EditThemePageContent } from '@/features/themes';

export default async function EditThemePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PermissionRoute permissions={PERMISSIONS.THEME_MANAGE}>
      <EditThemePageContent themeId={id} />
    </PermissionRoute>
  );
}
