import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tags,
  Image as ImageIcon,
  MessageSquare,
  Search,
  Users,
  ShieldCheck,
  Settings as SettingsIcon,
  Activity,
  Server,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { PERMISSIONS } from '@/constants/permissions';
import type { NavGroup } from '@/types/navigation';

/**
 * The ONE navigation manifest — docs/60_ADMIN_NAVIGATION.md "Architecture":
 * Sidebar + Breadcrumbs + Command Palette all render from this, never
 * three independently hand-maintained lists. Every `permissions` entry is
 * imported from the shared PERMISSIONS mirror, never a string literal
 * (docs/60 "Best Practices"). Matches docs/60's Navigation Manifest table
 * exactly — no route/permission invented beyond what's frozen there.
 *
 * Infrastructure only: the routes referenced below have NO corresponding
 * page.tsx yet (Frontend Milestone 1 forbids business pages) — this
 * manifest exists so the Sidebar/Breadcrumb renderers have real data to
 * filter and render against, ahead of Frontend Milestone 2 building the
 * actual pages.
 */
export const NAVIGATION: NavGroup[] = [
  {
    id: 'root',
    label: '',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
        permissions: [PERMISSIONS.DASHBOARD_VIEW],
      },
    ],
  },
  {
    id: 'content',
    label: 'Content',
    items: [
      {
        id: 'articles',
        label: 'Articles',
        href: ROUTES.ARTICLES,
        icon: FileText,
        permissions: [
          PERMISSIONS.ARTICLE_CREATE,
          PERMISSIONS.ARTICLE_UPDATE,
          PERMISSIONS.ARTICLE_DELETE,
          PERMISSIONS.ARTICLE_PUBLISH,
        ],
      },
      {
        id: 'categories',
        label: 'Categories',
        href: ROUTES.CATEGORIES,
        icon: FolderTree,
        permissions: [PERMISSIONS.CATEGORY_CREATE],
      },
      {
        id: 'tags',
        label: 'Tags',
        href: ROUTES.TAGS,
        icon: Tags,
        permissions: [PERMISSIONS.CATEGORY_CREATE],
      },
      {
        id: 'media',
        label: 'Media Library',
        href: ROUTES.MEDIA,
        icon: ImageIcon,
        permissions: [PERMISSIONS.MEDIA_UPLOAD, PERMISSIONS.MEDIA_DELETE],
      },
    ],
  },
  {
    id: 'community',
    label: 'Community',
    items: [{ id: 'comments', label: 'Comments', href: ROUTES.COMMENTS, icon: MessageSquare }],
  },
  {
    id: 'seo-group',
    label: 'SEO',
    items: [
      {
        id: 'seo',
        label: 'SEO',
        href: ROUTES.SEO,
        icon: Search,
        permissions: [PERMISSIONS.SEO_MANAGE],
      },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    items: [
      {
        id: 'users',
        label: 'Users',
        href: ROUTES.USERS,
        icon: Users,
        permissions: [PERMISSIONS.USERS_MANAGE],
      },
      {
        id: 'roles',
        label: 'Roles & Permissions',
        href: ROUTES.ROLES,
        icon: ShieldCheck,
        permissions: [PERMISSIONS.ROLES_MANAGE],
      },
      {
        id: 'settings',
        label: 'Settings',
        href: ROUTES.SETTINGS,
        icon: SettingsIcon,
        permissions: [PERMISSIONS.SETTINGS_MANAGE],
      },
    ],
  },
  {
    id: 'system-group',
    label: 'System',
    items: [
      {
        id: 'activity-logs',
        label: 'Activity Logs',
        href: ROUTES.ACTIVITY_LOGS,
        icon: Activity,
        permissions: [PERMISSIONS.SYSTEM_MANAGE],
      },
      {
        id: 'system',
        label: 'System',
        href: ROUTES.SYSTEM,
        icon: Server,
        permissions: [PERMISSIONS.SYSTEM_MANAGE],
      },
    ],
  },
];

/** Flattened view — used by the Breadcrumb renderer and a future Command
 * Palette (docs/60 "Command Palette"). */
export function flattenNavigation(groups: NavGroup[] = NAVIGATION) {
  return groups.flatMap((group) => group.items.flatMap((item) => [item, ...(item.children ?? [])]));
}
