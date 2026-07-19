import type { ReactNode } from 'react';

/** Generic content-width wrapper — the one place `container-page` +
 * responsive horizontal padding is applied, so layouts/components don't
 * repeat the same three utility classes. */
export function ThemeContainer({
  children,
  fullWidth = false,
  className,
}: {
  children: ReactNode;
  fullWidth?: boolean;
  className?: string;
}) {
  const base = fullWidth ? 'px-4 sm:px-6 lg:px-8' : 'container-page px-4 sm:px-6 lg:px-8';
  return <div className={className ? `${base} ${className}` : base}>{children}</div>;
}
