import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { ThemeDetailPageContent } from '@/features/themes';

export default async function ThemeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <PermissionRoute permissions={PERMISSIONS.THEME_MANAGE}>
      <ThemeDetailPageContent themeId={id} />
    </PermissionRoute>
  );
}
