import type { LucideIcon } from 'lucide-react';
import type { PermissionKey } from '@/constants/permissions';

/**
 * One shared shape driving Sidebar + Breadcrumbs + Command Palette —
 * docs/60_ADMIN_NAVIGATION.md "Architecture": "never three independently
 * hand-maintained lists that can drift out of sync."
 */
export interface NavItem {
  /** Unique key, used for React keys and breadcrumb matching. */
  id: string;
  label: string;
  href: string;
  icon?: LucideIcon;
  /** OR semantics — item is visible if the user holds ANY of these
   * permissions, matching the backend's own RequireAnyPermission pattern
   * (docs/60_ADMIN_NAVIGATION.md's Articles/Media rows). Omit entirely for
   * an authenticated-only item (e.g. Profile, Comments' own page). */
  permissions?: PermissionKey[];
  children?: NavItem[];
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}
