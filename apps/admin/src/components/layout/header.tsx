'use client';

import Link from 'next/link';
import { Menu, LogOut, User as UserIcon, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/use-auth';
import { useUiStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { initials } from '@/utils/string';
import { THEMES } from '@/constants/theme';
import { ROUTES } from '@/constants/routes';

/** Header — docs/56_ADMIN_FRONTEND_ARCHITECTURE.md "Layout System —
 * Dashboard Layout": "Sidebar navigation, topbar." Hosts the mobile
 * drawer trigger, Breadcrumbs, theme switcher, and user menu. */
export function Header() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const setMobileDrawerOpen = useUiStore((state) => state.setMobileDrawerOpen);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setMobileDrawerOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="size-5" aria-hidden="true" />
      </Button>

      <Breadcrumb />

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Change theme">
              {theme === THEMES.DARK ? (
                <Moon className="size-4" aria-hidden="true" />
              ) : theme === THEMES.LIGHT ? (
                <Sun className="size-4" aria-hidden="true" />
              ) : (
                <Monitor className="size-4" aria-hidden="true" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme(THEMES.LIGHT)}>
              <Sun className="size-4" aria-hidden="true" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme(THEMES.DARK)}>
              <Moon className="size-4" aria-hidden="true" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme(THEMES.SYSTEM)}>
              <Monitor className="size-4" aria-hidden="true" /> System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {user?.displayName ? (
                  initials(user.displayName)
                ) : (
                  <UserIcon className="size-3.5" aria-hidden="true" />
                )}
              </span>
              <span className="hidden text-sm sm:inline">{user?.displayName ?? user?.email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={ROUTES.PROFILE}>
                <UserIcon className="size-4" aria-hidden="true" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void logout()}>
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
