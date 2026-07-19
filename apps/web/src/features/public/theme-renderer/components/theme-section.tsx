import type { ReactNode } from 'react';
import { ThemeTitle } from './theme-title';

/** Generic vertical section wrapper with an optional heading — the themed
 * equivalent of the ad-hoc `<section>` blocks Home's 13.3 components each
 * hand-rolled; a future renderer can use this instead of repeating the
 * same heading + spacing markup. */
export function ThemeSection({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      {title ? <ThemeTitle level={2}>{title}</ThemeTitle> : null}
      <div className={title ? 'mt-6' : undefined}>{children}</div>
    </section>
  );
}
