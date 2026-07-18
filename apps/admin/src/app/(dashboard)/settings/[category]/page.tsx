import { notFound } from 'next/navigation';
import { PermissionRoute } from '@/components/guards/permission-route';
import { PERMISSIONS } from '@/constants/permissions';
import { CategorySettingsPageContent } from '@/features/settings';
import { SETTING_CATEGORY_LABELS } from '@/features/settings/constants/settings.constants';
import type { SettingCategory } from '@/features/settings/types/settings';

/** docs/56 "settings/[category]/page.tsx — one page per SettingCategory
 * (settings.manage)". Validated against the frozen 17-value
 * `SettingCategory` enum before rendering — an unrecognized category in the
 * URL 404s rather than rendering an empty/broken form. */
export default async function CategorySettingsPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;

  if (!(category in SETTING_CATEGORY_LABELS)) {
    notFound();
  }

  return (
    <PermissionRoute permissions={PERMISSIONS.SETTINGS_MANAGE}>
      <CategorySettingsPageContent category={category as SettingCategory} />
    </PermissionRoute>
  );
}
