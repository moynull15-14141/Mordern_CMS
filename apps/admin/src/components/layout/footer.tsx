import { APP_CONFIG } from '@/constants/app';

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-3 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} {APP_CONFIG.NAME}. All rights reserved.
    </footer>
  );
}
